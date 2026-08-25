begin;

create table public.policy_upload_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  category text not null,
  declared_mime_type text not null,
  declared_size bigint not null,
  temporary_path text not null unique,
  final_path text unique,
  status text not null default 'pending',
  detected_mime_type text,
  detected_size bigint,
  finalization_token uuid,
  finalization_started_at timestamptz,
  temporary_object_removed_at timestamptz,
  cleanup_claimed_at timestamptz,
  constraint policy_upload_sessions_category_check
    check (category in ('motor', 'property')),
  constraint policy_upload_sessions_declared_mime_check
    check (declared_mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  constraint policy_upload_sessions_declared_size_check
    check (declared_size between 1 and 10485760),
  constraint policy_upload_sessions_status_check
    check (status in ('pending', 'finalized', 'rejected', 'expired')),
  constraint policy_upload_sessions_expiry_check
    check (
      expires_at > created_at
      and expires_at <= created_at + interval '30 minutes'
    ),
  constraint policy_upload_sessions_temporary_path_check
    check (
      temporary_path ~ '^_pending/(motor|property)/[0-9a-f]{32}$'
      and split_part(temporary_path, '/', 2) = category
    ),
  constraint policy_upload_sessions_final_path_check
    check (
      final_path is null
      or (
        final_path ~ '^(motor|property)/[0-9a-f]{32}\.(pdf|jpg|png)$'
        and split_part(final_path, '/', 1) = category
      )
    ),
  constraint policy_upload_sessions_detected_mime_check
    check (
      detected_mime_type is null
      or detected_mime_type in ('application/pdf', 'image/jpeg', 'image/png')
    ),
  constraint policy_upload_sessions_detected_size_check
    check (
      detected_size is null
      or detected_size between 1 and 10485760
    ),
  constraint policy_upload_sessions_finalization_claim_check
    check (
      (finalization_token is null and finalization_started_at is null)
      or (finalization_token is not null and finalization_started_at is not null)
    ),
  constraint policy_upload_sessions_lifecycle_check
    check (
      (
        status = 'pending'
        and temporary_object_removed_at is null
      )
      or (
        status = 'finalized'
        and final_path is not null
        and detected_mime_type is not null
        and detected_size is not null
        and finalization_token is null
        and finalization_started_at is null
      )
      or (
        status in ('rejected', 'expired')
        and finalization_token is null
        and finalization_started_at is null
      )
    )
);

comment on table public.policy_upload_sessions is
  'PII-free server-only lifecycle records for path-scoped direct policy uploads.';
comment on column public.policy_upload_sessions.temporary_object_removed_at is
  'Set only after trusted cleanup runs beyond the signed-token lifetime; finalize and reject perform an immediate best-effort removal first.';

create index policy_upload_sessions_status_expires_at_idx
  on public.policy_upload_sessions (status, expires_at);
create index policy_upload_sessions_cleanup_idx
  on public.policy_upload_sessions (status, updated_at)
  where temporary_object_removed_at is null;
create index policy_upload_sessions_final_path_status_idx
  on public.policy_upload_sessions (final_path, status)
  where final_path is not null;

create function public.set_policy_upload_session_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new is distinct from old then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create trigger policy_upload_sessions_set_updated_at
before update on public.policy_upload_sessions
for each row
execute function public.set_policy_upload_session_updated_at();

create function public.claim_policy_upload_session(
  p_session_id uuid,
  p_now timestamptz
)
returns table (
  outcome text,
  upload_session_id uuid,
  category text,
  declared_mime_type text,
  declared_size bigint,
  temporary_path text,
  final_path text,
  detected_mime_type text,
  detected_size bigint,
  claim_token uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_session public.policy_upload_sessions%rowtype;
  v_claim_token uuid;
begin
  select sessions.*
  into v_session
  from public.policy_upload_sessions as sessions
  where sessions.id = p_session_id
  for update;

  if not found then
    return query
      select 'missing'::text, null::uuid, null::text, null::text,
        null::bigint, null::text, null::text, null::text,
        null::bigint, null::uuid;
    return;
  end if;

  if v_session.status = 'finalized' then
    return query
      select 'finalized'::text, v_session.id, v_session.category,
        v_session.declared_mime_type, v_session.declared_size,
        v_session.temporary_path, v_session.final_path,
        v_session.detected_mime_type, v_session.detected_size,
        null::uuid;
    return;
  end if;

  if v_session.status = 'rejected' then
    return query
      select 'rejected'::text, v_session.id, v_session.category,
        v_session.declared_mime_type, v_session.declared_size,
        v_session.temporary_path, v_session.final_path,
        v_session.detected_mime_type, v_session.detected_size,
        null::uuid;
    return;
  end if;

  if v_session.status = 'expired' or v_session.expires_at <= p_now then
    if v_session.status = 'pending' then
      update public.policy_upload_sessions as sessions
      set
        status = 'expired',
        finalization_token = null,
        finalization_started_at = null
      where sessions.id = v_session.id;
    end if;

    return query
      select 'expired'::text, v_session.id, v_session.category,
        v_session.declared_mime_type, v_session.declared_size,
        v_session.temporary_path, v_session.final_path,
        v_session.detected_mime_type, v_session.detected_size,
        null::uuid;
    return;
  end if;

  if
    v_session.finalization_token is not null
    and v_session.finalization_started_at > p_now - interval '2 minutes'
  then
    return query
      select 'busy'::text, v_session.id, v_session.category,
        v_session.declared_mime_type, v_session.declared_size,
        v_session.temporary_path, v_session.final_path,
        v_session.detected_mime_type, v_session.detected_size,
        null::uuid;
    return;
  end if;

  v_claim_token := gen_random_uuid();
  update public.policy_upload_sessions as sessions
  set
    finalization_token = v_claim_token,
    finalization_started_at = p_now
  where sessions.id = v_session.id;

  return query
    select 'claimed'::text, v_session.id, v_session.category,
      v_session.declared_mime_type, v_session.declared_size,
      v_session.temporary_path, v_session.final_path,
      v_session.detected_mime_type, v_session.detected_size,
      v_claim_token;
end;
$$;

create function public.reserve_policy_upload_destination(
  p_session_id uuid,
  p_claim_token uuid,
  p_final_path text,
  p_detected_mime_type text,
  p_detected_size bigint
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.policy_upload_sessions as sessions
  set
    final_path = coalesce(sessions.final_path, p_final_path),
    detected_mime_type = p_detected_mime_type,
    detected_size = p_detected_size
  where sessions.id = p_session_id
    and sessions.status = 'pending'
    and sessions.finalization_token = p_claim_token
    and (sessions.final_path is null or sessions.final_path = p_final_path);

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create function public.complete_policy_upload_session(
  p_session_id uuid,
  p_claim_token uuid,
  p_final_path text,
  p_detected_mime_type text,
  p_detected_size bigint
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.policy_upload_sessions as sessions
  set
    status = 'finalized',
    final_path = p_final_path,
    detected_mime_type = p_detected_mime_type,
    detected_size = p_detected_size,
    finalization_token = null,
    finalization_started_at = null,
    temporary_object_removed_at = null,
    cleanup_claimed_at = null
  where sessions.id = p_session_id
    and sessions.status = 'pending'
    and sessions.finalization_token = p_claim_token
    and sessions.final_path = p_final_path
    and sessions.detected_mime_type = p_detected_mime_type
    and sessions.detected_size = p_detected_size;

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create function public.reject_policy_upload_session(
  p_session_id uuid,
  p_claim_token uuid,
  p_detected_mime_type text,
  p_detected_size bigint
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer;
begin
  -- A live signed token could recreate the temporary object after immediate
  -- rejection cleanup. Leave the durable cleanup marker null so the trusted
  -- cleanup job verifies removal after the token has expired.
  update public.policy_upload_sessions as sessions
  set
    status = 'rejected',
    detected_mime_type = p_detected_mime_type,
    detected_size = p_detected_size,
    finalization_token = null,
    finalization_started_at = null,
    temporary_object_removed_at = null,
    cleanup_claimed_at = null
  where sessions.id = p_session_id
    and sessions.status = 'pending'
    and sessions.finalization_token = p_claim_token
    and sessions.final_path is null;

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create function public.release_policy_upload_claim(
  p_session_id uuid,
  p_claim_token uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.policy_upload_sessions as sessions
  set
    finalization_token = null,
    finalization_started_at = null
  where sessions.id = p_session_id
    and sessions.status = 'pending'
    and sessions.finalization_token = p_claim_token;

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create function public.claim_policy_upload_cleanup_candidates(
  p_expired_before timestamptz,
  p_claimed_at timestamptz
)
returns table (
  upload_session_id uuid,
  temporary_path text
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  with candidates as (
    select sessions.id
    from public.policy_upload_sessions as sessions
    where sessions.temporary_object_removed_at is null
      and (
        (
          sessions.status = 'finalized'
          and sessions.updated_at <= p_expired_before
        )
        or
        (
          sessions.status in ('rejected', 'expired')
          and sessions.updated_at <= p_expired_before
        )
        or (
          sessions.status = 'pending'
          and sessions.expires_at <= p_expired_before
          and (
            sessions.finalization_started_at is null
            or sessions.finalization_started_at <= p_expired_before
          )
        )
      )
      and (
        sessions.cleanup_claimed_at is null
        or sessions.cleanup_claimed_at <= p_claimed_at - interval '15 minutes'
      )
    order by sessions.created_at
    for update skip locked
    limit 500
  ), claimed as (
    update public.policy_upload_sessions as sessions
    set
      status = case
        when sessions.status = 'pending' then 'expired'
        else sessions.status
      end,
      finalization_token = null,
      finalization_started_at = null,
      cleanup_claimed_at = p_claimed_at
    from candidates
    where sessions.id = candidates.id
    returning sessions.id, sessions.temporary_path
  )
  select claimed.id, claimed.temporary_path
  from claimed;
end;
$$;

create function public.complete_policy_upload_cleanup(
  p_session_ids uuid[],
  p_removed_at timestamptz
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.policy_upload_sessions as sessions
  set
    temporary_object_removed_at = p_removed_at,
    cleanup_claimed_at = null
  where sessions.id = any(p_session_ids)
    and sessions.status in ('finalized', 'rejected', 'expired')
    and sessions.temporary_object_removed_at is null;

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

alter table public.policy_upload_sessions enable row level security;

revoke all privileges on table public.policy_upload_sessions
  from PUBLIC, anon, authenticated, service_role;
grant select, insert, update on table public.policy_upload_sessions
  to service_role;

revoke execute on function public.set_policy_upload_session_updated_at()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.claim_policy_upload_session(uuid, timestamptz)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.reserve_policy_upload_destination(uuid, uuid, text, text, bigint)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.complete_policy_upload_session(uuid, uuid, text, text, bigint)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.reject_policy_upload_session(uuid, uuid, text, bigint)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.release_policy_upload_claim(uuid, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.claim_policy_upload_cleanup_candidates(timestamptz, timestamptz)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.complete_policy_upload_cleanup(uuid[], timestamptz)
  from PUBLIC, anon, authenticated, service_role;

grant execute on function public.claim_policy_upload_session(uuid, timestamptz)
  to service_role;
grant execute on function public.reserve_policy_upload_destination(uuid, uuid, text, text, bigint)
  to service_role;
grant execute on function public.complete_policy_upload_session(uuid, uuid, text, text, bigint)
  to service_role;
grant execute on function public.reject_policy_upload_session(uuid, uuid, text, bigint)
  to service_role;
grant execute on function public.release_policy_upload_claim(uuid, uuid)
  to service_role;
grant execute on function public.claim_policy_upload_cleanup_candidates(timestamptz, timestamptz)
  to service_role;
grant execute on function public.complete_policy_upload_cleanup(uuid[], timestamptz)
  to service_role;

commit;
