begin;

create table public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  handoff_id uuid not null,
  status text not null default 'pending',
  attribution_reference text,
  external_conversion_reference text,
  reported_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reversed_at timestamptz,
  commission_status text not null default 'not_reported',
  commission_amount numeric(12, 2),
  commission_currency text,
  commission_reported_at timestamptz,
  commission_paid_at timestamptz,
  internal_note text,
  constraint affiliate_conversions_handoff_id_fkey
    foreign key (handoff_id)
    references public.lead_partner_handoffs (id)
    on delete cascade,
  constraint affiliate_conversions_handoff_id_key
    unique (handoff_id),
  constraint affiliate_conversions_status_check
    check (status in ('pending', 'confirmed', 'rejected', 'reversed')),
  constraint affiliate_conversions_attribution_reference_length_check
    check (
      attribution_reference is null
      or char_length(attribution_reference) <= 250
    ),
  constraint affiliate_conversions_external_reference_length_check
    check (
      external_conversion_reference is null
      or char_length(external_conversion_reference) <= 250
    ),
  constraint affiliate_conversions_commission_status_check
    check (
      commission_status in (
        'not_reported',
        'pending',
        'approved',
        'paid',
        'rejected',
        'reversed'
      )
    ),
  constraint affiliate_conversions_commission_amount_check
    check (commission_amount is null or commission_amount >= 0),
  constraint affiliate_conversions_commission_currency_check
    check (
      commission_currency is null
      or (
        char_length(commission_currency) = 3
        and commission_currency ~ '^[A-Z]{3}$'
      )
    ),
  constraint affiliate_conversions_commission_value_pair_check
    check (
      (commission_amount is null and commission_currency is null)
      or (
        commission_amount is not null
        and commission_currency is not null
      )
    ),
  constraint affiliate_conversions_approved_value_check
    check (
      commission_status not in ('approved', 'paid')
      or (
        commission_amount is not null
        and commission_currency is not null
      )
    ),
  constraint affiliate_conversions_paid_requirements_check
    check (
      commission_status <> 'paid'
      or (
        commission_amount is not null
        and commission_currency is not null
        and commission_paid_at is not null
      )
    ),
  constraint affiliate_conversions_confirmed_timestamp_check
    check (
      status not in ('confirmed', 'reversed')
      or confirmed_at is not null
    ),
  constraint affiliate_conversions_reversed_timestamp_check
    check (status <> 'reversed' or reversed_at is not null),
  constraint affiliate_conversions_confirmed_at_order_check
    check (confirmed_at is null or confirmed_at >= reported_at),
  constraint affiliate_conversions_reversed_at_order_check
    check (
      reversed_at is null
      or (
        reversed_at >= reported_at
        and (confirmed_at is null or reversed_at >= confirmed_at)
      )
    ),
  constraint affiliate_conversions_commission_reported_timestamp_check
    check (
      commission_status = 'not_reported'
      or commission_reported_at is not null
    ),
  constraint affiliate_conversions_commission_reported_at_order_check
    check (
      commission_reported_at is null
      or commission_reported_at >= reported_at
    ),
  constraint affiliate_conversions_commission_paid_at_order_check
    check (
      commission_paid_at is null
      or commission_reported_at is null
      or commission_paid_at >= commission_reported_at
    ),
  constraint affiliate_conversions_internal_note_length_check
    check (internal_note is null or char_length(internal_note) <= 1000)
);

comment on table public.affiliate_conversions is
  'Operational affiliate conversion and commission tracking for one exact partner handoff. This table does not represent insurance advice, underwriting, or payment processing.';

comment on column public.affiliate_conversions.status is
  'pending: reported but not confirmed; confirmed: confirmed by a partner or network; rejected: not accepted or qualified; reversed: a previously confirmed conversion was cancelled or clawed back.';

comment on column public.affiliate_conversions.commission_status is
  'Commission lifecycle, tracked independently from conversion status: not_reported, pending, approved, paid, rejected, or reversed.';

comment on column public.affiliate_conversions.attribution_reference is
  'Historical snapshot of a safe partner, network, campaign, or referral identifier. Never store API keys, tokens, passwords, or other secrets.';

comment on column public.affiliate_conversions.external_conversion_reference is
  'Optional non-public conversion identifier supplied by a partner or network. Its format is intentionally unconstrained except for length.';

create table public.affiliate_conversion_history (
  id uuid primary key default gen_random_uuid(),
  conversion_id uuid not null,
  created_at timestamptz not null default now(),
  previous_conversion_status text,
  new_conversion_status text not null,
  previous_commission_status text,
  new_commission_status text not null,
  change_source text not null default 'system',
  note text,
  constraint affiliate_conversion_history_conversion_id_fkey
    foreign key (conversion_id)
    references public.affiliate_conversions (id)
    on delete cascade,
  constraint affiliate_conversion_history_previous_conversion_status_check
    check (
      previous_conversion_status is null
      or previous_conversion_status in (
        'pending',
        'confirmed',
        'rejected',
        'reversed'
      )
    ),
  constraint affiliate_conversion_history_new_conversion_status_check
    check (
      new_conversion_status in (
        'pending',
        'confirmed',
        'rejected',
        'reversed'
      )
    ),
  constraint affiliate_conversion_history_previous_commission_status_check
    check (
      previous_commission_status is null
      or previous_commission_status in (
        'not_reported',
        'pending',
        'approved',
        'paid',
        'rejected',
        'reversed'
      )
    ),
  constraint affiliate_conversion_history_new_commission_status_check
    check (
      new_commission_status in (
        'not_reported',
        'pending',
        'approved',
        'paid',
        'rejected',
        'reversed'
      )
    ),
  constraint affiliate_conversion_history_change_source_check
    check (change_source in ('system', 'admin', 'partner', 'api')),
  constraint affiliate_conversion_history_note_length_check
    check (note is null or char_length(note) <= 1000)
);

create index affiliate_conversions_status_idx
  on public.affiliate_conversions (status);

create index affiliate_conversions_commission_status_idx
  on public.affiliate_conversions (commission_status);

create index affiliate_conversions_created_at_idx
  on public.affiliate_conversions (created_at desc);

create index affiliate_conversion_history_conversion_created_at_idx
  on public.affiliate_conversion_history (conversion_id, created_at desc);

create trigger affiliate_conversions_set_updated_at
before update on public.affiliate_conversions
for each row
execute function public.set_partner_model_updated_at();

create function public.record_affiliate_conversion_history()
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
        'app.affiliate_conversion_change_source',
        true
      ),
      ''
    ),
    'system'
  );
  v_note := nullif(
    pg_catalog.current_setting(
      'app.affiliate_conversion_note',
      true
    ),
    ''
  );

  if tg_op = 'INSERT' then
    insert into public.affiliate_conversion_history (
      conversion_id,
      previous_conversion_status,
      new_conversion_status,
      previous_commission_status,
      new_commission_status,
      change_source,
      note
    )
    values (
      new.id,
      null,
      new.status,
      null,
      new.commission_status,
      v_change_source,
      v_note
    );

    return new;
  end if;

  if old.status is not distinct from new.status
    and old.commission_status is not distinct from new.commission_status then
    return new;
  end if;

  insert into public.affiliate_conversion_history (
    conversion_id,
    previous_conversion_status,
    new_conversion_status,
    previous_commission_status,
    new_commission_status,
    change_source,
    note
  )
  values (
    new.id,
    old.status,
    new.status,
    old.commission_status,
    new.commission_status,
    v_change_source,
    v_note
  );

  return new;
end;
$$;

create trigger affiliate_conversion_history_after_insert
after insert on public.affiliate_conversions
for each row
execute function public.record_affiliate_conversion_history();

create trigger affiliate_conversion_history_after_status_update
after update of status, commission_status on public.affiliate_conversions
for each row
when (
  old.status is distinct from new.status
  or old.commission_status is distinct from new.commission_status
)
execute function public.record_affiliate_conversion_history();

create function public.create_affiliate_conversion(
  p_handoff_id uuid,
  p_attribution_reference text default null,
  p_external_conversion_reference text default null,
  p_internal_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_handoff_status text;
  v_partner_attribution_reference text;
  v_effective_attribution_reference text;
  v_conversion_id uuid;
  v_previous_change_source text;
  v_previous_note text;
begin
  if p_handoff_id is null then
    raise exception using
      errcode = '22004',
      message = 'Handoff ID is required.';
  end if;

  if p_attribution_reference is not null
    and pg_catalog.char_length(p_attribution_reference) > 250 then
    raise exception using
      errcode = '22001',
      message = 'Attribution reference must be 250 characters or fewer.';
  end if;

  if p_external_conversion_reference is not null
    and pg_catalog.char_length(p_external_conversion_reference) > 250 then
    raise exception using
      errcode = '22001',
      message = 'External conversion reference must be 250 characters or fewer.';
  end if;

  if p_internal_note is not null
    and pg_catalog.char_length(p_internal_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Internal note must be 1000 characters or fewer.';
  end if;

  select
    handoffs.status,
    partners.affiliate_reference
  into
    v_handoff_status,
    v_partner_attribution_reference
  from public.lead_partner_handoffs as handoffs
  join public.partners as partners
    on partners.id = handoffs.partner_id
  where handoffs.id = p_handoff_id
  for share of handoffs, partners;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Handoff not found.';
  end if;

  if v_handoff_status not in ('sent', 'accepted') then
    raise exception using
      errcode = '22023',
      message = 'A conversion requires a sent or accepted handoff.';
  end if;

  v_effective_attribution_reference := coalesce(
    p_attribution_reference,
    v_partner_attribution_reference
  );

  if v_effective_attribution_reference is not null
    and pg_catalog.char_length(v_effective_attribution_reference) > 250 then
    raise exception using
      errcode = '22001',
      message = 'Attribution reference must be 250 characters or fewer.';
  end if;

  v_previous_change_source := pg_catalog.current_setting(
    'app.affiliate_conversion_change_source',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.affiliate_conversion_note',
    true
  );

  perform pg_catalog.set_config(
    'app.affiliate_conversion_change_source',
    'api',
    true
  );
  perform pg_catalog.set_config(
    'app.affiliate_conversion_note',
    coalesce(p_internal_note, ''),
    true
  );

  begin
    begin
      insert into public.affiliate_conversions (
        handoff_id,
        status,
        attribution_reference,
        external_conversion_reference,
        reported_at,
        commission_status,
        internal_note
      )
      values (
        p_handoff_id,
        'pending',
        v_effective_attribution_reference,
        p_external_conversion_reference,
        now(),
        'not_reported',
        p_internal_note
      )
      returning id into v_conversion_id;
    exception
      when unique_violation then
        raise exception using
          errcode = '23505',
          message = 'A conversion already exists for this handoff.';
    end;
  exception
    when others then
      perform pg_catalog.set_config(
        'app.affiliate_conversion_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.affiliate_conversion_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.affiliate_conversion_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.affiliate_conversion_note',
    coalesce(v_previous_note, ''),
    true
  );

  return v_conversion_id;
end;
$$;

create function public.update_affiliate_conversion_status(
  p_conversion_id uuid,
  p_status text,
  p_external_conversion_reference text default null,
  p_internal_note text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_current_status text;
  v_handoff_id uuid;
  v_lead_id uuid;
  v_partner_id uuid;
  v_previous_change_source text;
  v_previous_note text;
begin
  if p_conversion_id is null then
    raise exception using
      errcode = '22004',
      message = 'Conversion ID is required.';
  end if;

  if p_status is null
    or p_status not in ('pending', 'confirmed', 'rejected', 'reversed') then
    raise exception using
      errcode = '22023',
      message = 'Invalid conversion status.';
  end if;

  if p_external_conversion_reference is not null
    and pg_catalog.char_length(p_external_conversion_reference) > 250 then
    raise exception using
      errcode = '22001',
      message = 'External conversion reference must be 250 characters or fewer.';
  end if;

  if p_internal_note is not null
    and pg_catalog.char_length(p_internal_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Internal note must be 1000 characters or fewer.';
  end if;

  select conversions.status, conversions.handoff_id
  into v_current_status, v_handoff_id
  from public.affiliate_conversions as conversions
  where conversions.id = p_conversion_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Affiliate conversion not found.';
  end if;

  if v_current_status = p_status then
    return false;
  end if;

  if not (
    (v_current_status = 'pending' and p_status in ('confirmed', 'rejected'))
    or (v_current_status = 'confirmed' and p_status = 'reversed')
  ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid affiliate conversion status transition.';
  end if;

  v_previous_change_source := pg_catalog.current_setting(
    'app.affiliate_conversion_change_source',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.affiliate_conversion_note',
    true
  );

  perform pg_catalog.set_config(
    'app.affiliate_conversion_change_source',
    'api',
    true
  );
  perform pg_catalog.set_config(
    'app.affiliate_conversion_note',
    coalesce(p_internal_note, ''),
    true
  );

  begin
    update public.affiliate_conversions
    set
      status = p_status,
      confirmed_at = case
        when v_current_status = 'pending' and p_status = 'confirmed'
          then coalesce(confirmed_at, now())
        else confirmed_at
      end,
      reversed_at = case
        when v_current_status = 'confirmed' and p_status = 'reversed'
          then now()
        else reversed_at
      end,
      external_conversion_reference = coalesce(
        p_external_conversion_reference,
        external_conversion_reference
      ),
      internal_note = coalesce(p_internal_note, internal_note)
    where id = p_conversion_id;

    if v_current_status = 'pending' and p_status = 'confirmed' then
      select handoffs.lead_id, handoffs.partner_id
      into v_lead_id, v_partner_id
      from public.lead_partner_handoffs as handoffs
      where handoffs.id = v_handoff_id;

      if not found then
        raise exception using
          errcode = 'P0002',
          message = 'Associated handoff not found.';
      end if;

      perform public.change_lead_status(
        v_lead_id,
        'completed',
        'api',
        v_partner_id::text,
        'Affiliate conversion confirmed'
      );
    end if;
  exception
    when others then
      perform pg_catalog.set_config(
        'app.affiliate_conversion_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.affiliate_conversion_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.affiliate_conversion_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.affiliate_conversion_note',
    coalesce(v_previous_note, ''),
    true
  );

  return true;
end;
$$;

create function public.update_affiliate_commission(
  p_conversion_id uuid,
  p_commission_status text,
  p_commission_amount numeric default null,
  p_commission_currency text default null,
  p_internal_note text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_current_commission_status text;
  v_current_commission_amount numeric(12, 2);
  v_current_commission_currency text;
  v_effective_commission_amount numeric;
  v_effective_commission_currency text;
  v_previous_change_source text;
  v_previous_note text;
begin
  if p_conversion_id is null then
    raise exception using
      errcode = '22004',
      message = 'Conversion ID is required.';
  end if;

  if p_commission_status is null
    or p_commission_status not in (
      'not_reported',
      'pending',
      'approved',
      'paid',
      'rejected',
      'reversed'
    ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid commission status.';
  end if;

  if p_commission_amount is not null and p_commission_amount < 0 then
    raise exception using
      errcode = '22023',
      message = 'Commission amount cannot be negative.';
  end if;

  if p_commission_currency is not null
    and (
      pg_catalog.char_length(p_commission_currency) <> 3
      or p_commission_currency !~ '^[A-Z]{3}$'
    ) then
    raise exception using
      errcode = '22023',
      message = 'Commission currency must be exactly three uppercase ASCII letters.';
  end if;

  if (p_commission_amount is null) <> (p_commission_currency is null) then
    raise exception using
      errcode = '22023',
      message = 'Commission amount and currency must be supplied together.';
  end if;

  if p_internal_note is not null
    and pg_catalog.char_length(p_internal_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Internal note must be 1000 characters or fewer.';
  end if;

  select
    conversions.commission_status,
    conversions.commission_amount,
    conversions.commission_currency
  into
    v_current_commission_status,
    v_current_commission_amount,
    v_current_commission_currency
  from public.affiliate_conversions as conversions
  where conversions.id = p_conversion_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Affiliate conversion not found.';
  end if;

  if v_current_commission_status = p_commission_status then
    return false;
  end if;

  if not (
    (
      v_current_commission_status = 'not_reported'
      and p_commission_status in ('pending', 'approved', 'rejected')
    )
    or (
      v_current_commission_status = 'pending'
      and p_commission_status in ('approved', 'rejected')
    )
    or (
      v_current_commission_status = 'approved'
      and p_commission_status in ('paid', 'reversed')
    )
    or (
      v_current_commission_status = 'paid'
      and p_commission_status = 'reversed'
    )
  ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid affiliate commission status transition.';
  end if;

  v_effective_commission_amount := coalesce(
    p_commission_amount,
    v_current_commission_amount
  );
  v_effective_commission_currency := coalesce(
    p_commission_currency,
    v_current_commission_currency
  );

  if (v_effective_commission_amount is null)
    <> (v_effective_commission_currency is null) then
    raise exception using
      errcode = '22023',
      message = 'Commission amount and currency must both be present or both be absent.';
  end if;

  if p_commission_status in ('approved', 'paid')
    and (
      v_effective_commission_amount is null
      or v_effective_commission_currency is null
    ) then
    raise exception using
      errcode = '22023',
      message = 'Approved and paid commissions require an amount and currency.';
  end if;

  v_previous_change_source := pg_catalog.current_setting(
    'app.affiliate_conversion_change_source',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.affiliate_conversion_note',
    true
  );

  perform pg_catalog.set_config(
    'app.affiliate_conversion_change_source',
    'api',
    true
  );
  perform pg_catalog.set_config(
    'app.affiliate_conversion_note',
    coalesce(p_internal_note, ''),
    true
  );

  begin
    update public.affiliate_conversions
    set
      commission_status = p_commission_status,
      commission_amount = v_effective_commission_amount,
      commission_currency = v_effective_commission_currency,
      commission_reported_at = case
        when v_current_commission_status = 'not_reported'
          and p_commission_status in ('pending', 'approved', 'rejected')
          then coalesce(commission_reported_at, now())
        else commission_reported_at
      end,
      commission_paid_at = case
        when p_commission_status = 'paid' then now()
        else commission_paid_at
      end,
      internal_note = coalesce(p_internal_note, internal_note)
    where id = p_conversion_id;
  exception
    when others then
      perform pg_catalog.set_config(
        'app.affiliate_conversion_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.affiliate_conversion_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.affiliate_conversion_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.affiliate_conversion_note',
    coalesce(v_previous_note, ''),
    true
  );

  return true;
end;
$$;

alter table public.affiliate_conversions enable row level security;
alter table public.affiliate_conversion_history enable row level security;

revoke all privileges on table public.affiliate_conversions
  from PUBLIC, anon, authenticated;
revoke all privileges on table public.affiliate_conversion_history
  from PUBLIC, anon, authenticated;
revoke execute on function public.record_affiliate_conversion_history()
  from PUBLIC, anon, authenticated;
revoke execute on function public.create_affiliate_conversion(
  uuid,
  text,
  text,
  text
) from PUBLIC, anon, authenticated;
revoke execute on function public.update_affiliate_conversion_status(
  uuid,
  text,
  text,
  text
) from PUBLIC, anon, authenticated;
revoke execute on function public.update_affiliate_commission(
  uuid,
  text,
  numeric,
  text,
  text
) from PUBLIC, anon, authenticated;

grant select, insert, update on table public.affiliate_conversions
  to service_role;
grant select, insert on table public.affiliate_conversion_history
  to service_role;
grant execute on function public.create_affiliate_conversion(
  uuid,
  text,
  text,
  text
) to service_role;
grant execute on function public.update_affiliate_conversion_status(
  uuid,
  text,
  text,
  text
) to service_role;
grant execute on function public.update_affiliate_commission(
  uuid,
  text,
  numeric,
  text,
  text
) to service_role;

commit;
