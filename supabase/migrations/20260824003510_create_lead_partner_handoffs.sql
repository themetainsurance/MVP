begin;

create table public.lead_partner_handoffs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid not null,
  partner_id uuid not null,
  handoff_method text not null,
  status text not null default 'pending',
  assigned_at timestamptz not null default now(),
  sent_at timestamptz,
  responded_at timestamptz,
  external_reference text,
  failure_code text,
  internal_note text,
  constraint lead_partner_handoffs_lead_id_fkey
    foreign key (lead_id)
    references public.leads (id)
    on delete cascade,
  constraint lead_partner_handoffs_partner_id_fkey
    foreign key (partner_id)
    references public.partners (id)
    on delete restrict,
  constraint lead_partner_handoffs_handoff_method_check
    check (handoff_method in ('manual', 'email', 'portal', 'api')),
  constraint lead_partner_handoffs_status_check
    check (
      status in (
        'pending',
        'sent',
        'accepted',
        'rejected',
        'failed',
        'cancelled'
      )
    ),
  constraint lead_partner_handoffs_external_reference_length_check
    check (
      external_reference is null
      or char_length(external_reference) <= 250
    ),
  constraint lead_partner_handoffs_failure_code_length_check
    check (failure_code is null or char_length(failure_code) <= 100),
  constraint lead_partner_handoffs_internal_note_length_check
    check (internal_note is null or char_length(internal_note) <= 1000),
  constraint lead_partner_handoffs_sent_at_check
    check (sent_at is null or sent_at >= assigned_at),
  constraint lead_partner_handoffs_responded_at_check
    check (
      responded_at is null
      or (sent_at is not null and responded_at >= sent_at)
    ),
  constraint lead_partner_handoffs_sent_status_timestamp_check
    check (
      status not in ('sent', 'accepted', 'rejected')
      or sent_at is not null
    ),
  constraint lead_partner_handoffs_response_status_timestamp_check
    check (
      status not in ('accepted', 'rejected')
      or responded_at is not null
    )
);

comment on column public.lead_partner_handoffs.status is
  'pending: assigned but not sent; sent: sent to partner; accepted: partner acknowledged or accepted; rejected: partner declined; failed: technical or operational failure; cancelled: internally cancelled before completion.';

create table public.lead_partner_handoff_history (
  id uuid primary key default gen_random_uuid(),
  handoff_id uuid not null,
  created_at timestamptz not null default now(),
  previous_status text,
  new_status text not null,
  change_source text not null default 'system',
  note text,
  constraint lead_partner_handoff_history_handoff_id_fkey
    foreign key (handoff_id)
    references public.lead_partner_handoffs (id)
    on delete cascade,
  constraint lead_partner_handoff_history_previous_status_check
    check (
      previous_status is null
      or previous_status in (
        'pending',
        'sent',
        'accepted',
        'rejected',
        'failed',
        'cancelled'
      )
    ),
  constraint lead_partner_handoff_history_new_status_check
    check (
      new_status in (
        'pending',
        'sent',
        'accepted',
        'rejected',
        'failed',
        'cancelled'
      )
    ),
  constraint lead_partner_handoff_history_change_source_check
    check (change_source in ('system', 'admin', 'partner', 'api')),
  constraint lead_partner_handoff_history_note_length_check
    check (note is null or char_length(note) <= 1000)
);

create index lead_partner_handoffs_lead_created_at_idx
  on public.lead_partner_handoffs (lead_id, created_at desc);

create index lead_partner_handoffs_partner_created_at_idx
  on public.lead_partner_handoffs (partner_id, created_at desc);

create index lead_partner_handoffs_status_idx
  on public.lead_partner_handoffs (status);

create index lead_partner_handoffs_lead_status_idx
  on public.lead_partner_handoffs (lead_id, status);

create unique index lead_partner_handoffs_unresolved_lead_partner_idx
  on public.lead_partner_handoffs (lead_id, partner_id)
  where status in ('pending', 'sent');

create index lead_partner_handoff_history_handoff_created_at_idx
  on public.lead_partner_handoff_history (handoff_id, created_at desc);

create trigger lead_partner_handoffs_set_updated_at
before update on public.lead_partner_handoffs
for each row
execute function public.set_partner_model_updated_at();

create function public.record_lead_partner_handoff_history()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_change_source text;
  v_note text;
begin
  v_change_source := coalesce(
    nullif(
      pg_catalog.current_setting(
        'app.partner_handoff_change_source',
        true
      ),
      ''
    ),
    'system'
  );
  v_note := nullif(
    pg_catalog.current_setting(
      'app.partner_handoff_note',
      true
    ),
    ''
  );

  if tg_op = 'INSERT' then
    insert into public.lead_partner_handoff_history (
      handoff_id,
      previous_status,
      new_status,
      change_source,
      note
    )
    values (
      new.id,
      null,
      new.status,
      v_change_source,
      v_note
    );

    return new;
  end if;

  if old.status is not distinct from new.status then
    return new;
  end if;

  insert into public.lead_partner_handoff_history (
    handoff_id,
    previous_status,
    new_status,
    change_source,
    note
  )
  values (
    new.id,
    old.status,
    new.status,
    v_change_source,
    v_note
  );

  return new;
end;
$$;

create trigger lead_partner_handoff_history_after_insert
after insert on public.lead_partner_handoffs
for each row
execute function public.record_lead_partner_handoff_history();

create trigger lead_partner_handoff_history_after_status_update
after update of status on public.lead_partner_handoffs
for each row
when (old.status is distinct from new.status)
execute function public.record_lead_partner_handoff_history();

create function public.create_lead_partner_handoff(
  p_lead_id uuid,
  p_partner_id uuid,
  p_handoff_method text default null,
  p_internal_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_insurance_type text;
  v_partner_status text;
  v_partner_handoff_method text;
  v_effective_handoff_method text;
  v_handoff_id uuid;
  v_previous_change_source text;
  v_previous_note text;
begin
  if p_lead_id is null then
    raise exception using
      errcode = '22004',
      message = 'Lead ID is required.';
  end if;

  if p_partner_id is null then
    raise exception using
      errcode = '22004',
      message = 'Partner ID is required.';
  end if;

  if p_internal_note is not null
    and pg_catalog.char_length(p_internal_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Internal note must be 1000 characters or fewer.';
  end if;

  select leads.insurance_type
  into v_insurance_type
  from public.leads as leads
  where leads.id = p_lead_id;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Lead not found.';
  end if;

  select partners.status, partners.handoff_method
  into v_partner_status, v_partner_handoff_method
  from public.partners as partners
  where partners.id = p_partner_id
  for share;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Partner not found.';
  end if;

  if v_partner_status <> 'active' then
    raise exception using
      errcode = '22023',
      message = 'Partner is not active.';
  end if;

  v_effective_handoff_method := coalesce(
    p_handoff_method,
    v_partner_handoff_method
  );

  if v_effective_handoff_method is null
    or v_effective_handoff_method not in (
      'manual',
      'email',
      'portal',
      'api'
    ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid partner handoff method.';
  end if;

  perform 1
  from public.partner_capabilities as capabilities
  where capabilities.partner_id = p_partner_id
    and capabilities.insurance_type = v_insurance_type
    and capabilities.status = 'active'
  limit 1
  for share;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'Partner has no active capability for this insurance type.';
  end if;

  -- public.leads has no normalized top-level country_code. Jurisdiction is
  -- intentionally not inferred from free-text or JSON details in this point.

  v_previous_change_source := pg_catalog.current_setting(
    'app.partner_handoff_change_source',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.partner_handoff_note',
    true
  );

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    'api',
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(p_internal_note, ''),
    true
  );

  begin
    begin
      insert into public.lead_partner_handoffs (
        lead_id,
        partner_id,
        handoff_method,
        status,
        assigned_at,
        internal_note
      )
      values (
        p_lead_id,
        p_partner_id,
        v_effective_handoff_method,
        'pending',
        now(),
        p_internal_note
      )
      returning id into v_handoff_id;
    exception
      when unique_violation then
        raise exception using
          errcode = '23505',
          message = 'An unresolved handoff already exists for this lead and partner.';
    end;
  exception
    when others then
      perform pg_catalog.set_config(
        'app.partner_handoff_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.partner_handoff_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(v_previous_note, ''),
    true
  );

  return v_handoff_id;
end;
$$;

create function public.mark_lead_handoff_sent(
  p_handoff_id uuid,
  p_external_reference text default null,
  p_internal_note text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_lead_id uuid;
  v_partner_id uuid;
  v_previous_change_source text;
  v_previous_note text;
begin
  if p_handoff_id is null then
    raise exception using
      errcode = '22004',
      message = 'Handoff ID is required.';
  end if;

  if p_external_reference is not null
    and pg_catalog.char_length(p_external_reference) > 250 then
    raise exception using
      errcode = '22001',
      message = 'External reference must be 250 characters or fewer.';
  end if;

  if p_internal_note is not null
    and pg_catalog.char_length(p_internal_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Internal note must be 1000 characters or fewer.';
  end if;

  v_previous_change_source := pg_catalog.current_setting(
    'app.partner_handoff_change_source',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.partner_handoff_note',
    true
  );

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    'api',
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(p_internal_note, ''),
    true
  );

  begin
    update public.lead_partner_handoffs
    set
      status = 'sent',
      sent_at = now(),
      external_reference = coalesce(
        p_external_reference,
        external_reference
      ),
      internal_note = coalesce(p_internal_note, internal_note)
    where id = p_handoff_id
      and status = 'pending'
    returning lead_id, partner_id
    into v_lead_id, v_partner_id;

    if not found then
      raise exception using
        errcode = '22023',
        message = 'Handoff does not exist or is not pending.';
    end if;

    perform public.change_lead_status(
      v_lead_id,
      'sent_to_partner',
      'api',
      v_partner_id::text,
      'Lead sent to partner'
    );
  exception
    when others then
      perform pg_catalog.set_config(
        'app.partner_handoff_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.partner_handoff_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(v_previous_note, ''),
    true
  );

  return true;
end;
$$;

create function public.record_lead_handoff_response(
  p_handoff_id uuid,
  p_status text,
  p_external_reference text default null,
  p_internal_note text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_previous_change_source text;
  v_previous_note text;
begin
  if p_handoff_id is null then
    raise exception using
      errcode = '22004',
      message = 'Handoff ID is required.';
  end if;

  if p_status is null or p_status not in ('accepted', 'rejected') then
    raise exception using
      errcode = '22023',
      message = 'Response status must be accepted or rejected.';
  end if;

  if p_external_reference is not null
    and pg_catalog.char_length(p_external_reference) > 250 then
    raise exception using
      errcode = '22001',
      message = 'External reference must be 250 characters or fewer.';
  end if;

  if p_internal_note is not null
    and pg_catalog.char_length(p_internal_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Internal note must be 1000 characters or fewer.';
  end if;

  v_previous_change_source := pg_catalog.current_setting(
    'app.partner_handoff_change_source',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.partner_handoff_note',
    true
  );

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    'partner',
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(p_internal_note, ''),
    true
  );

  begin
    update public.lead_partner_handoffs
    set
      status = p_status,
      responded_at = now(),
      external_reference = coalesce(
        p_external_reference,
        external_reference
      ),
      internal_note = coalesce(p_internal_note, internal_note)
    where id = p_handoff_id
      and status = 'sent';

    if not found then
      raise exception using
        errcode = '22023',
        message = 'Handoff does not exist or is not awaiting a response.';
    end if;
  exception
    when others then
      perform pg_catalog.set_config(
        'app.partner_handoff_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.partner_handoff_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(v_previous_note, ''),
    true
  );

  return true;
end;
$$;

create function public.mark_lead_handoff_failed(
  p_handoff_id uuid,
  p_failure_code text default null,
  p_internal_note text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_previous_change_source text;
  v_previous_note text;
begin
  if p_handoff_id is null then
    raise exception using
      errcode = '22004',
      message = 'Handoff ID is required.';
  end if;

  if p_failure_code is not null
    and pg_catalog.char_length(p_failure_code) > 100 then
    raise exception using
      errcode = '22001',
      message = 'Failure code must be 100 characters or fewer.';
  end if;

  if p_internal_note is not null
    and pg_catalog.char_length(p_internal_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Internal note must be 1000 characters or fewer.';
  end if;

  v_previous_change_source := pg_catalog.current_setting(
    'app.partner_handoff_change_source',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.partner_handoff_note',
    true
  );

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    'system',
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(p_internal_note, ''),
    true
  );

  begin
    update public.lead_partner_handoffs
    set
      status = 'failed',
      failure_code = coalesce(p_failure_code, failure_code),
      internal_note = coalesce(p_internal_note, internal_note)
    where id = p_handoff_id
      and status in ('pending', 'sent');

    if not found then
      raise exception using
        errcode = '22023',
        message = 'Handoff does not exist or cannot be marked failed.';
    end if;
  exception
    when others then
      perform pg_catalog.set_config(
        'app.partner_handoff_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.partner_handoff_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(v_previous_note, ''),
    true
  );

  return true;
end;
$$;

create function public.cancel_lead_handoff(
  p_handoff_id uuid,
  p_internal_note text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_previous_change_source text;
  v_previous_note text;
begin
  if p_handoff_id is null then
    raise exception using
      errcode = '22004',
      message = 'Handoff ID is required.';
  end if;

  if p_internal_note is not null
    and pg_catalog.char_length(p_internal_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Internal note must be 1000 characters or fewer.';
  end if;

  v_previous_change_source := pg_catalog.current_setting(
    'app.partner_handoff_change_source',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.partner_handoff_note',
    true
  );

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    'admin',
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(p_internal_note, ''),
    true
  );

  begin
    update public.lead_partner_handoffs
    set
      status = 'cancelled',
      internal_note = coalesce(p_internal_note, internal_note)
    where id = p_handoff_id
      and status = 'pending';

    if not found then
      raise exception using
        errcode = '22023',
        message = 'Handoff does not exist or cannot be cancelled.';
    end if;
  exception
    when others then
      perform pg_catalog.set_config(
        'app.partner_handoff_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.partner_handoff_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.partner_handoff_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.partner_handoff_note',
    coalesce(v_previous_note, ''),
    true
  );

  return true;
end;
$$;

alter table public.lead_partner_handoffs enable row level security;
alter table public.lead_partner_handoff_history enable row level security;

revoke all privileges on table public.lead_partner_handoffs
  from PUBLIC, anon, authenticated;
revoke all privileges on table public.lead_partner_handoff_history
  from PUBLIC, anon, authenticated;
revoke execute on function public.record_lead_partner_handoff_history()
  from PUBLIC, anon, authenticated;
revoke execute on function public.create_lead_partner_handoff(
  uuid,
  uuid,
  text,
  text
) from PUBLIC, anon, authenticated;
revoke execute on function public.mark_lead_handoff_sent(
  uuid,
  text,
  text
) from PUBLIC, anon, authenticated;
revoke execute on function public.record_lead_handoff_response(
  uuid,
  text,
  text,
  text
) from PUBLIC, anon, authenticated;
revoke execute on function public.mark_lead_handoff_failed(
  uuid,
  text,
  text
) from PUBLIC, anon, authenticated;
revoke execute on function public.cancel_lead_handoff(uuid, text)
  from PUBLIC, anon, authenticated;

grant select, insert, update on table public.lead_partner_handoffs
  to service_role;
grant select, insert on table public.lead_partner_handoff_history
  to service_role;
grant execute on function public.create_lead_partner_handoff(
  uuid,
  uuid,
  text,
  text
) to service_role;
grant execute on function public.mark_lead_handoff_sent(
  uuid,
  text,
  text
) to service_role;
grant execute on function public.record_lead_handoff_response(
  uuid,
  text,
  text,
  text
) to service_role;
grant execute on function public.mark_lead_handoff_failed(
  uuid,
  text,
  text
) to service_role;
grant execute on function public.cancel_lead_handoff(uuid, text)
  to service_role;

commit;
