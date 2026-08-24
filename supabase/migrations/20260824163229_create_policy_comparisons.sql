begin;

-- Factual, administrator-authored policy comparisons. Existing lead, partner,
-- handoff and conversion tables remain the operational source of truth.
create table public.policy_comparisons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  lead_id uuid not null references public.leads (id) on delete restrict,
  insurance_type text not null,
  status text not null default 'draft',
  title text not null,
  customer_intro text,
  internal_note text,
  version integer not null default 1,
  ready_at timestamptz,
  archived_at timestamptz,
  constraint policy_comparisons_insurance_type_check
    check (insurance_type in ('travel', 'motor', 'property')),
  constraint policy_comparisons_status_check
    check (status in ('draft', 'ready', 'archived')),
  constraint policy_comparisons_title_check
    check (char_length(btrim(title)) between 1 and 180),
  constraint policy_comparisons_customer_intro_check
    check (customer_intro is null or char_length(customer_intro) <= 1000),
  constraint policy_comparisons_internal_note_check
    check (internal_note is null or char_length(internal_note) <= 2000),
  constraint policy_comparisons_version_check check (version >= 1),
  constraint policy_comparisons_ready_at_check
    check (status <> 'ready' or ready_at is not null),
  constraint policy_comparisons_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

create table public.policy_comparison_options (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  comparison_id uuid not null
    references public.policy_comparisons (id) on delete restrict,
  option_type text not null,
  status text not null default 'active',
  sort_order smallint not null default 0,
  partner_id uuid references public.partners (id) on delete restrict,
  handoff_id uuid references public.lead_partner_handoffs (id) on delete restrict,
  provider_name text not null,
  product_name text,
  internal_reference text,
  effective_from date,
  effective_to date,
  facts jsonb not null default '{}'::jsonb,
  customer_note text,
  internal_note text,
  version integer not null default 1,
  constraint policy_comparison_options_type_check
    check (option_type in ('current_policy', 'partner_offer')),
  constraint policy_comparison_options_status_check
    check (status in ('active', 'removed')),
  constraint policy_comparison_options_relationship_check
    check (
      (option_type = 'current_policy' and partner_id is null and handoff_id is null)
      or (option_type = 'partner_offer' and partner_id is not null)
    ),
  constraint policy_comparison_options_sort_order_check
    check (sort_order between 0 and 100),
  constraint policy_comparison_options_provider_name_check
    check (char_length(btrim(provider_name)) between 1 and 200),
  constraint policy_comparison_options_product_name_check
    check (product_name is null or char_length(product_name) <= 200),
  constraint policy_comparison_options_internal_reference_check
    check (internal_reference is null or char_length(internal_reference) <= 250),
  constraint policy_comparison_options_effective_dates_check
    check (effective_from is null or effective_to is null or effective_to >= effective_from),
  constraint policy_comparison_options_facts_check
    check (
      jsonb_typeof(facts) = 'object'
      and octet_length(facts::text) <= 61440
    ),
  constraint policy_comparison_options_customer_note_check
    check (customer_note is null or char_length(customer_note) <= 1000),
  constraint policy_comparison_options_internal_note_check
    check (internal_note is null or char_length(internal_note) <= 2000),
  constraint policy_comparison_options_version_check check (version >= 1)
);

create table public.policy_comparison_shares (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null
    references public.policy_comparisons (id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id) on delete set null,
  source_version integer not null,
  snapshot jsonb not null,
  constraint policy_comparison_shares_token_hash_check
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint policy_comparison_shares_expiry_check
    check (expires_at > created_at and expires_at <= created_at + interval '90 days'),
  constraint policy_comparison_shares_source_version_check
    check (source_version >= 1),
  constraint policy_comparison_shares_snapshot_check
    check (
      jsonb_typeof(snapshot) = 'object'
      and octet_length(snapshot::text) <= 307200
      and snapshot ?& array[
        'schema_version', 'generated_at', 'insurance_type', 'title',
        'customer_intro', 'current_policy', 'offers', 'comparisons'
      ]
    ),
  constraint policy_comparison_shares_revocation_check
    check (
      (revoked_at is null and revoked_by is null)
      or revoked_at is not null
    )
);

comment on table public.policy_comparison_shares is
  'Immutable, customer-safe factual comparison snapshots. Raw share tokens are never stored.';

create index policy_comparisons_lead_created_at_idx
  on public.policy_comparisons (lead_id, created_at desc);
create index policy_comparisons_status_updated_at_idx
  on public.policy_comparisons (status, updated_at desc);
create index policy_comparisons_insurance_type_updated_at_idx
  on public.policy_comparisons (insurance_type, updated_at desc);
create index policy_comparison_options_comparison_sort_idx
  on public.policy_comparison_options (comparison_id, status, sort_order, created_at);
create index policy_comparison_options_partner_id_idx
  on public.policy_comparison_options (partner_id)
  where partner_id is not null;
create index policy_comparison_options_handoff_id_idx
  on public.policy_comparison_options (handoff_id)
  where handoff_id is not null;
create unique index policy_comparison_options_one_active_current_idx
  on public.policy_comparison_options (comparison_id)
  where option_type = 'current_policy' and status = 'active';
create index policy_comparison_shares_comparison_created_at_idx
  on public.policy_comparison_shares (comparison_id, created_at desc);
create index policy_comparison_shares_public_lookup_idx
  on public.policy_comparison_shares (token_hash, expires_at)
  where revoked_at is null;

create function public.reject_policy_comparison_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'Policy comparison records cannot be hard-deleted.';
end;
$$;

create function public.validate_policy_comparison_row()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_insurance_type text;
begin
  select leads.insurance_type
  into v_insurance_type
  from public.leads as leads
  where leads.id = new.lead_id;

  if not found or v_insurance_type <> new.insurance_type then
    raise exception 'Comparison insurance type must match its lead.';
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.created_at <> old.created_at
      or new.created_by is distinct from old.created_by
      or new.lead_id <> old.lead_id
      or new.insurance_type <> old.insurance_type then
      raise exception 'Immutable comparison fields cannot be changed.';
    end if;

    if new.status <> old.status and not (
      (old.status = 'draft' and new.status in ('ready', 'archived'))
      or (old.status = 'ready' and new.status in ('draft', 'archived'))
      or (old.status = 'archived' and new.status = 'draft')
    ) then
      raise exception 'Invalid comparison status transition.';
    end if;

    if old.status <> 'draft' and (
      new.title is distinct from old.title
      or new.customer_intro is distinct from old.customer_intro
      or new.internal_note is distinct from old.internal_note
    ) then
      raise exception 'Only draft comparisons can be edited.';
    end if;
  end if;

  return new;
end;
$$;

create function public.set_policy_comparison_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_meaningful_change boolean;
begin
  v_meaningful_change :=
    new.status is distinct from old.status
    or new.title is distinct from old.title
    or new.customer_intro is distinct from old.customer_intro
    or new.internal_note is distinct from old.internal_note;

  if v_meaningful_change then
    new.version = old.version + 1;
    new.updated_at = now();
  elsif new.version = old.version + 1 then
    new.updated_at = now();
  else
    new.version = old.version;
    new.updated_at = old.updated_at;
  end if;
  return new;
end;
$$;

create function public.validate_policy_comparison_option()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_comparison public.policy_comparisons%rowtype;
  v_partner_status text;
  v_handoff_lead_id uuid;
  v_handoff_partner_id uuid;
begin
  select comparisons.*
  into v_comparison
  from public.policy_comparisons as comparisons
  where comparisons.id = new.comparison_id
  for update;

  if not found then
    raise exception 'Comparison not found.';
  end if;

  if v_comparison.status <> 'draft' then
    raise exception 'Options can only be changed on a draft comparison.';
  end if;

  if tg_op = 'UPDATE' and (
    new.id <> old.id
    or new.created_at <> old.created_at
    or new.comparison_id <> old.comparison_id
    or new.option_type <> old.option_type
    or new.partner_id is distinct from old.partner_id
    or new.handoff_id is distinct from old.handoff_id
  ) then
    raise exception 'Immutable option relationship fields cannot be changed.';
  end if;

  if new.option_type = 'partner_offer' and tg_op = 'INSERT' then
    select partners.status
    into v_partner_status
    from public.partners as partners
    where partners.id = new.partner_id;

    if not found or v_partner_status <> 'active' then
      raise exception 'Partner must be active.';
    end if;

    if not exists (
      select 1
      from public.partner_capabilities as capabilities
      where capabilities.partner_id = new.partner_id
        and capabilities.insurance_type = v_comparison.insurance_type
        and capabilities.status = 'active'
    ) then
      raise exception 'Partner has no active matching capability.';
    end if;

    if new.handoff_id is not null then
      select handoffs.lead_id, handoffs.partner_id
      into v_handoff_lead_id, v_handoff_partner_id
      from public.lead_partner_handoffs as handoffs
      where handoffs.id = new.handoff_id;

      if not found
        or v_handoff_lead_id <> v_comparison.lead_id
        or v_handoff_partner_id <> new.partner_id then
        raise exception 'Handoff does not match the comparison lead and partner.';
      end if;
    end if;
  end if;

  if new.option_type = 'partner_offer'
    and new.status = 'active'
    and (
      select count(*)
      from public.policy_comparison_options as options
      where options.comparison_id = new.comparison_id
        and options.option_type = 'partner_offer'
        and options.status = 'active'
        and options.id <> new.id
    ) >= 5 then
    raise exception 'A comparison can have at most five active partner offers.';
  end if;

  return new;
end;
$$;

create function public.set_policy_comparison_option_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new is distinct from old then
      new.version = old.version + 1;
      new.updated_at = now();
    else
      new.version = old.version;
      new.updated_at = old.updated_at;
    end if;
  end if;
  return new;
end;
$$;

create function public.bump_policy_comparison_from_option()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.policy_comparisons
    set version = version + 1
    where id = new.comparison_id;
  elsif new is distinct from old then
    update public.policy_comparisons
    set version = version + 1
    where id = new.comparison_id;
  end if;
  return new;
end;
$$;

create function public.protect_policy_comparison_share()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.id <> old.id
    or new.comparison_id <> old.comparison_id
    or new.created_at <> old.created_at
    or new.created_by is distinct from old.created_by
    or new.token_hash <> old.token_hash
    or new.expires_at <> old.expires_at
    or new.source_version <> old.source_version
    or new.snapshot <> old.snapshot then
    raise exception 'Comparison share snapshots are immutable.';
  end if;

  if old.revoked_at is not null and (
    new.revoked_at is distinct from old.revoked_at
    or new.revoked_by is distinct from old.revoked_by
  ) then
    raise exception 'Comparison share revocation is permanent.';
  end if;
  return new;
end;
$$;

create trigger policy_comparisons_10_validate
before insert or update on public.policy_comparisons
for each row execute function public.validate_policy_comparison_row();
create trigger policy_comparisons_20_version
before update on public.policy_comparisons
for each row execute function public.set_policy_comparison_version();
create trigger policy_comparisons_90_reject_delete
before delete on public.policy_comparisons
for each row execute function public.reject_policy_comparison_delete();

create trigger policy_comparison_options_10_validate
before insert or update on public.policy_comparison_options
for each row execute function public.validate_policy_comparison_option();
create trigger policy_comparison_options_20_version
before update on public.policy_comparison_options
for each row execute function public.set_policy_comparison_option_version();
create trigger policy_comparison_options_80_bump_parent
after insert or update on public.policy_comparison_options
for each row execute function public.bump_policy_comparison_from_option();
create trigger policy_comparison_options_90_reject_delete
before delete on public.policy_comparison_options
for each row execute function public.reject_policy_comparison_delete();

create trigger policy_comparison_shares_10_protect
before update on public.policy_comparison_shares
for each row execute function public.protect_policy_comparison_share();
create trigger policy_comparison_shares_90_reject_delete
before delete on public.policy_comparison_shares
for each row execute function public.reject_policy_comparison_delete();

create function public.create_policy_comparison(
  p_lead_id uuid,
  p_title text,
  p_internal_note text,
  p_actor_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_insurance_type text;
  v_id uuid;
begin
  select leads.insurance_type
  into v_insurance_type
  from public.leads as leads
  where leads.id = p_lead_id
  for share;

  if not found or v_insurance_type not in ('travel', 'motor', 'property') then
    raise exception 'Lead is not eligible for a policy comparison.';
  end if;

  insert into public.policy_comparisons (
    created_by, updated_by, lead_id, insurance_type, title, internal_note
  ) values (
    p_actor_id, p_actor_id, p_lead_id, v_insurance_type, btrim(p_title), nullif(btrim(p_internal_note), '')
  ) returning id into v_id;
  return v_id;
end;
$$;

create function public.update_policy_comparison(
  p_comparison_id uuid,
  p_title text,
  p_customer_intro text,
  p_internal_note text,
  p_actor_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.policy_comparisons
  set title = btrim(p_title),
      customer_intro = nullif(btrim(p_customer_intro), ''),
      internal_note = nullif(btrim(p_internal_note), ''),
      updated_by = p_actor_id
  where id = p_comparison_id and status = 'draft';
  return found;
end;
$$;

create function public.create_policy_comparison_option(
  p_comparison_id uuid,
  p_option_type text,
  p_partner_id uuid,
  p_handoff_id uuid,
  p_provider_name text,
  p_product_name text,
  p_internal_reference text,
  p_effective_from date,
  p_effective_to date,
  p_facts jsonb,
  p_customer_note text,
  p_internal_note text,
  p_sort_order smallint,
  p_actor_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.policy_comparison_options (
    comparison_id, option_type, partner_id, handoff_id, provider_name,
    product_name, internal_reference, effective_from, effective_to, facts,
    customer_note, internal_note, sort_order
  ) values (
    p_comparison_id, p_option_type, p_partner_id, p_handoff_id,
    btrim(p_provider_name), nullif(btrim(p_product_name), ''),
    nullif(btrim(p_internal_reference), ''), p_effective_from, p_effective_to,
    p_facts, nullif(btrim(p_customer_note), ''),
    nullif(btrim(p_internal_note), ''), p_sort_order
  ) returning id into v_id;

  update public.policy_comparisons
  set updated_by = p_actor_id
  where id = p_comparison_id;
  return v_id;
end;
$$;

create function public.update_policy_comparison_option(
  p_comparison_id uuid,
  p_option_id uuid,
  p_provider_name text,
  p_product_name text,
  p_internal_reference text,
  p_effective_from date,
  p_effective_to date,
  p_facts jsonb,
  p_customer_note text,
  p_internal_note text,
  p_sort_order smallint,
  p_actor_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_comparison_id uuid;
begin
  update public.policy_comparison_options
  set provider_name = btrim(p_provider_name),
      product_name = nullif(btrim(p_product_name), ''),
      internal_reference = nullif(btrim(p_internal_reference), ''),
      effective_from = p_effective_from,
      effective_to = p_effective_to,
      facts = p_facts,
      customer_note = nullif(btrim(p_customer_note), ''),
      internal_note = nullif(btrim(p_internal_note), ''),
      sort_order = p_sort_order
  where id = p_option_id and comparison_id = p_comparison_id
  returning comparison_id into v_comparison_id;

  if found then
    update public.policy_comparisons
    set updated_by = p_actor_id
    where id = v_comparison_id;
    return true;
  end if;
  return false;
end;
$$;

create function public.remove_policy_comparison_option(
  p_comparison_id uuid,
  p_option_id uuid,
  p_actor_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_comparison_id uuid;
begin
  update public.policy_comparison_options
  set status = 'removed'
  where id = p_option_id and comparison_id = p_comparison_id and status = 'active'
  returning comparison_id into v_comparison_id;

  if found then
    update public.policy_comparisons
    set updated_by = p_actor_id
    where id = v_comparison_id;
    return true;
  end if;
  return false;
end;
$$;

create function public.change_policy_comparison_status(
  p_comparison_id uuid,
  p_status text,
  p_actor_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_comparison public.policy_comparisons%rowtype;
  v_current_count integer;
  v_offer_count integer;
  v_incomplete_count integer;
begin
  select comparisons.*
  into v_comparison
  from public.policy_comparisons as comparisons
  where comparisons.id = p_comparison_id
  for update;

  if not found then return false; end if;
  if p_status = v_comparison.status then return true; end if;

  if p_status = 'ready' then
    select
      count(*) filter (where option_type = 'current_policy'),
      count(*) filter (where option_type = 'partner_offer'),
      count(*) filter (
        where char_length(btrim(provider_name)) = 0
          or facts = '{}'::jsonb
          or not exists (
            select 1
            from jsonb_each(facts) as entries(key, value)
            where coalesce(entries.value ->> 'state', entries.value ->> 'status', 'not_stated') <> 'not_stated'
          )
      )
    into v_current_count, v_offer_count, v_incomplete_count
    from public.policy_comparison_options
    where comparison_id = p_comparison_id and status = 'active';

    if v_current_count <> 1
      or v_offer_count < 1
      or v_offer_count > 5
      or v_incomplete_count > 0 then
      raise exception 'Ready comparisons require one current policy, one to five offers, and stated facts.';
    end if;
  end if;

  update public.policy_comparisons
  set status = p_status,
      ready_at = case when p_status = 'ready' then now() else ready_at end,
      archived_at = case when p_status = 'archived' then now() else null end,
      updated_by = p_actor_id
  where id = p_comparison_id;

  if p_status = 'archived' then
    update public.policy_comparison_shares
    set revoked_at = coalesce(revoked_at, now()),
        revoked_by = case when revoked_at is null then p_actor_id else revoked_by end
    where comparison_id = p_comparison_id and revoked_at is null;
  end if;
  return true;
end;
$$;

create function public.create_policy_comparison_share(
  p_comparison_id uuid,
  p_token_hash text,
  p_expires_at timestamptz,
  p_source_version integer,
  p_snapshot jsonb,
  p_actor_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_comparison public.policy_comparisons%rowtype;
  v_id uuid;
begin
  select comparisons.*
  into v_comparison
  from public.policy_comparisons as comparisons
  where comparisons.id = p_comparison_id
  for update;

  if not found or v_comparison.status <> 'ready' then
    raise exception 'Only ready comparisons can be shared.';
  end if;
  if p_source_version <> v_comparison.version then
    raise exception 'Comparison changed before the share was created.';
  end if;
  if p_snapshot ->> 'insurance_type' <> v_comparison.insurance_type
    or p_snapshot ->> 'title' <> v_comparison.title
    or (p_snapshot ->> 'schema_version')::integer <> 1 then
    raise exception 'Share snapshot does not match the comparison.';
  end if;

  insert into public.policy_comparison_shares (
    comparison_id, created_by, token_hash, expires_at, source_version, snapshot
  ) values (
    p_comparison_id, p_actor_id, p_token_hash, p_expires_at,
    p_source_version, p_snapshot
  ) returning id into v_id;
  return v_id;
end;
$$;

create function public.revoke_policy_comparison_share(
  p_comparison_id uuid,
  p_share_id uuid,
  p_actor_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.policy_comparison_shares
  set revoked_at = now(), revoked_by = p_actor_id
  where id = p_share_id
    and comparison_id = p_comparison_id
    and revoked_at is null;
  return found;
end;
$$;

alter table public.policy_comparisons enable row level security;
alter table public.policy_comparison_options enable row level security;
alter table public.policy_comparison_shares enable row level security;

revoke all privileges on table public.policy_comparisons
  from PUBLIC, anon, authenticated, service_role;
revoke all privileges on table public.policy_comparison_options
  from PUBLIC, anon, authenticated, service_role;
revoke all privileges on table public.policy_comparison_shares
  from PUBLIC, anon, authenticated, service_role;
grant select, insert, update on table public.policy_comparisons to service_role;
grant select, insert, update on table public.policy_comparison_options to service_role;
grant select, insert, update on table public.policy_comparison_shares to service_role;

revoke execute on function public.reject_policy_comparison_delete()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.validate_policy_comparison_row()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.set_policy_comparison_version()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.validate_policy_comparison_option()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.set_policy_comparison_option_version()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.bump_policy_comparison_from_option()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.protect_policy_comparison_share()
  from PUBLIC, anon, authenticated, service_role;

revoke execute on function public.create_policy_comparison(uuid, text, text, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.update_policy_comparison(uuid, text, text, text, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.create_policy_comparison_option(uuid, text, uuid, uuid, text, text, text, date, date, jsonb, text, text, smallint, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.update_policy_comparison_option(uuid, uuid, text, text, text, date, date, jsonb, text, text, smallint, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.remove_policy_comparison_option(uuid, uuid, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.change_policy_comparison_status(uuid, text, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.create_policy_comparison_share(uuid, text, timestamptz, integer, jsonb, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.revoke_policy_comparison_share(uuid, uuid, uuid)
  from PUBLIC, anon, authenticated, service_role;

grant execute on function public.create_policy_comparison(uuid, text, text, uuid)
  to service_role;
grant execute on function public.update_policy_comparison(uuid, text, text, text, uuid)
  to service_role;
grant execute on function public.create_policy_comparison_option(uuid, text, uuid, uuid, text, text, text, date, date, jsonb, text, text, smallint, uuid)
  to service_role;
grant execute on function public.update_policy_comparison_option(uuid, uuid, text, text, text, date, date, jsonb, text, text, smallint, uuid)
  to service_role;
grant execute on function public.remove_policy_comparison_option(uuid, uuid, uuid)
  to service_role;
grant execute on function public.change_policy_comparison_status(uuid, text, uuid)
  to service_role;
grant execute on function public.create_policy_comparison_share(uuid, text, timestamptz, integer, jsonb, uuid)
  to service_role;
grant execute on function public.revoke_policy_comparison_share(uuid, uuid, uuid)
  to service_role;

commit;
