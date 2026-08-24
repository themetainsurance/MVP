begin;

create table public.analytics_sessions (
  id uuid primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  landing_path text not null,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  constraint analytics_sessions_timestamp_order_check
    check (last_seen_at >= first_seen_at),
  constraint analytics_sessions_landing_path_check
    check (
      char_length(landing_path) between 1 and 300
      and landing_path like '/%'
      and landing_path !~ '[?#]'
      and landing_path !~ '[[:cntrl:]]'
      and landing_path !~ '^/(admin|api)(/|$)'
    ),
  constraint analytics_sessions_referrer_host_check
    check (
      referrer_host is null
      or (
        char_length(referrer_host) between 1 and 253
        and referrer_host = lower(referrer_host)
        and referrer_host !~ '[/?#[:space:][:cntrl:]]'
        and referrer_host not in (
          'themetainsurance.com',
          'www.themetainsurance.com'
        )
      )
    ),
  constraint analytics_sessions_utm_source_check
    check (
      utm_source is null
      or (
        char_length(utm_source) between 1 and 100
        and utm_source = btrim(utm_source)
        and utm_source !~ '[[:cntrl:]]'
      )
    ),
  constraint analytics_sessions_utm_medium_check
    check (
      utm_medium is null
      or (
        char_length(utm_medium) between 1 and 100
        and utm_medium = btrim(utm_medium)
        and utm_medium !~ '[[:cntrl:]]'
      )
    ),
  constraint analytics_sessions_utm_campaign_check
    check (
      utm_campaign is null
      or (
        char_length(utm_campaign) between 1 and 150
        and utm_campaign = btrim(utm_campaign)
        and utm_campaign !~ '[[:cntrl:]]'
      )
    ),
  constraint analytics_sessions_utm_term_check
    check (
      utm_term is null
      or (
        char_length(utm_term) between 1 and 150
        and utm_term = btrim(utm_term)
        and utm_term !~ '[[:cntrl:]]'
      )
    ),
  constraint analytics_sessions_utm_content_check
    check (
      utm_content is null
      or (
        char_length(utm_content) between 1 and 150
        and utm_content = btrim(utm_content)
        and utm_content !~ '[[:cntrl:]]'
      )
    )
);

comment on table public.analytics_sessions is
  'Privacy-conscious, ephemeral first-party website sessions. These records intentionally contain no IP address, user-agent string, persistent visitor identifier, authentication session, or insurance request fields.';

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  client_event_id uuid not null,
  session_id uuid not null,
  created_at timestamptz not null default now(),
  event_type text not null,
  page_path text,
  insurance_type text,
  form_mode text,
  constraint analytics_events_client_event_id_key
    unique (client_event_id),
  constraint analytics_events_session_id_fkey
    foreign key (session_id)
    references public.analytics_sessions (id)
    on delete cascade,
  constraint analytics_events_event_type_check
    check (event_type in ('page_view', 'form_started')),
  constraint analytics_events_page_path_check
    check (
      page_path is null
      or (
        char_length(page_path) between 1 and 300
        and page_path like '/%'
        and page_path !~ '[?#]'
        and page_path !~ '[[:cntrl:]]'
        and page_path !~ '^/(admin|api)(/|$)'
      )
    ),
  constraint analytics_events_insurance_type_check
    check (
      insurance_type is null
      or insurance_type in ('travel', 'motor', 'property')
    ),
  constraint analytics_events_form_mode_check
    check (
      (
        event_type = 'page_view'
        and form_mode is null
      )
      or (
        event_type = 'form_started'
        and form_mode in ('manual', 'upload', 'ai_assistant', 'unknown')
      )
    )
);

comment on table public.analytics_events is
  'Limited public-site events. Only page_view and form_started are recorded; operational lead, handoff, conversion, and commission records remain authoritative.';

create table public.lead_attributions (
  lead_id uuid primary key,
  created_at timestamptz not null default now(),
  session_id uuid,
  landing_path text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  constraint lead_attributions_lead_id_fkey
    foreign key (lead_id)
    references public.leads (id)
    on delete cascade,
  constraint lead_attributions_session_id_fkey
    foreign key (session_id)
    references public.analytics_sessions (id)
    on delete set null,
  constraint lead_attributions_landing_path_check
    check (
      landing_path is null
      or (
        char_length(landing_path) between 1 and 300
        and landing_path like '/%'
        and landing_path !~ '[?#]'
        and landing_path !~ '[[:cntrl:]]'
        and landing_path !~ '^/(admin|api)(/|$)'
      )
    ),
  constraint lead_attributions_referrer_host_check
    check (
      referrer_host is null
      or (
        char_length(referrer_host) between 1 and 253
        and referrer_host = lower(referrer_host)
        and referrer_host !~ '[/?#[:space:][:cntrl:]]'
      )
    ),
  constraint lead_attributions_utm_source_check
    check (utm_source is null or char_length(utm_source) between 1 and 100),
  constraint lead_attributions_utm_medium_check
    check (utm_medium is null or char_length(utm_medium) between 1 and 100),
  constraint lead_attributions_utm_campaign_check
    check (utm_campaign is null or char_length(utm_campaign) between 1 and 150),
  constraint lead_attributions_utm_term_check
    check (utm_term is null or char_length(utm_term) between 1 and 150),
  constraint lead_attributions_utm_content_check
    check (utm_content is null or char_length(utm_content) between 1 and 150)
);

comment on table public.lead_attributions is
  'PII-free first-touch attribution snapshots for real leads. Existing leads are intentionally not backfilled with invented attribution.';

create index analytics_sessions_first_seen_at_idx
  on public.analytics_sessions (first_seen_at desc);

create index analytics_sessions_last_seen_at_idx
  on public.analytics_sessions (last_seen_at desc);

create index analytics_events_session_created_at_idx
  on public.analytics_events (session_id, created_at desc);

create index analytics_events_event_type_created_at_idx
  on public.analytics_events (event_type, created_at desc);

create index analytics_events_insurance_event_created_at_idx
  on public.analytics_events (insurance_type, event_type, created_at desc);

-- The sentinel cannot collide with the constrained insurance_type values.
-- This makes NULL insurance types deterministic while permitting one start per
-- session, insurance type, and form mode.
create unique index analytics_events_form_started_flow_key
  on public.analytics_events (
    session_id,
    coalesce(insurance_type, '__unknown__'),
    form_mode
  )
  where event_type = 'form_started';

create index lead_attributions_created_at_idx
  on public.lead_attributions (created_at desc);

create index lead_attributions_session_id_idx
  on public.lead_attributions (session_id);

create index lead_attributions_utm_source_medium_campaign_idx
  on public.lead_attributions (utm_source, utm_medium, utm_campaign);

create function public.record_first_party_analytics_event(
  p_session_id uuid,
  p_client_event_id uuid,
  p_event_type text,
  p_page_path text,
  p_insurance_type text,
  p_form_mode text,
  p_landing_path text,
  p_referrer_host text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_term text,
  p_utm_content text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inserted integer;
begin
  insert into public.analytics_sessions as sessions (
    id,
    landing_path,
    referrer_host,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content
  ) values (
    p_session_id,
    p_landing_path,
    p_referrer_host,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    p_utm_term,
    p_utm_content
  )
  on conflict (id) do update
  set last_seen_at = pg_catalog.greatest(sessions.last_seen_at, now());

  insert into public.analytics_events (
    client_event_id,
    session_id,
    event_type,
    page_path,
    insurance_type,
    form_mode
  ) values (
    p_client_event_id,
    p_session_id,
    p_event_type,
    p_page_path,
    p_insurance_type,
    p_form_mode
  )
  on conflict do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted = 1;
end;
$$;

create function public.snapshot_lead_attribution(
  p_lead_id uuid,
  p_session_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inserted integer;
begin
  insert into public.lead_attributions (
    lead_id,
    session_id,
    landing_path,
    referrer_host,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content
  )
  select
    p_lead_id,
    sessions.id,
    sessions.landing_path,
    sessions.referrer_host,
    sessions.utm_source,
    sessions.utm_medium,
    sessions.utm_campaign,
    sessions.utm_term,
    sessions.utm_content
  from public.analytics_sessions as sessions
  where sessions.id = p_session_id
  on conflict (lead_id) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted = 1;
end;
$$;

create function public.get_admin_analytics_summary(
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns table (
  sessions bigint,
  page_views bigint,
  sessions_with_form_start bigint,
  form_starts bigint,
  leads bigint,
  handed_off_leads bigint,
  confirmed_conversion_leads bigint,
  paid_commission_leads bigint,
  reversed_conversion_leads bigint,
  unattributed_leads bigint,
  total_handoffs_sent bigint,
  total_confirmed_conversions bigint,
  total_paid_commissions bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_start_at is null
    or p_end_at is null
    or p_start_at >= p_end_at
    or p_end_at - p_start_at > interval '91 days' then
    raise exception using
      errcode = '22023',
      message = 'Invalid analytics date range.';
  end if;

  return query
  with lead_cohort as (
    select leads.id
    from public.leads as leads
    where leads.created_at >= p_start_at
      and leads.created_at < p_end_at
  )
  select
    (
      select count(*)
      from public.analytics_sessions as analytics_sessions
      where analytics_sessions.first_seen_at >= p_start_at
        and analytics_sessions.first_seen_at < p_end_at
    )::bigint,
    (
      select count(*)
      from public.analytics_events as analytics_events
      where analytics_events.event_type = 'page_view'
        and analytics_events.created_at >= p_start_at
        and analytics_events.created_at < p_end_at
    )::bigint,
    (
      select count(distinct analytics_events.session_id)
      from public.analytics_events as analytics_events
      where analytics_events.event_type = 'form_started'
        and analytics_events.created_at >= p_start_at
        and analytics_events.created_at < p_end_at
    )::bigint,
    (
      select count(*)
      from public.analytics_events as analytics_events
      where analytics_events.event_type = 'form_started'
        and analytics_events.created_at >= p_start_at
        and analytics_events.created_at < p_end_at
    )::bigint,
    (select count(*) from lead_cohort)::bigint,
    (
      select count(*)
      from lead_cohort
      where exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        where handoffs.lead_id = lead_cohort.id
          and handoffs.sent_at is not null
      )
    )::bigint,
    (
      select count(*)
      from lead_cohort
      where exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        join public.affiliate_conversions as conversions
          on conversions.handoff_id = handoffs.id
        where handoffs.lead_id = lead_cohort.id
          and conversions.status = 'confirmed'
      )
    )::bigint,
    (
      select count(*)
      from lead_cohort
      where exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        join public.affiliate_conversions as conversions
          on conversions.handoff_id = handoffs.id
        where handoffs.lead_id = lead_cohort.id
          and conversions.commission_status = 'paid'
      )
    )::bigint,
    (
      select count(*)
      from lead_cohort
      where exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        join public.affiliate_conversions as conversions
          on conversions.handoff_id = handoffs.id
        where handoffs.lead_id = lead_cohort.id
          and conversions.status = 'reversed'
      )
    )::bigint,
    (
      select count(*)
      from lead_cohort
      where not exists (
        select 1
        from public.lead_attributions as attributions
        where attributions.lead_id = lead_cohort.id
      )
    )::bigint,
    (
      select count(*)
      from public.lead_partner_handoffs as handoffs
      join lead_cohort on lead_cohort.id = handoffs.lead_id
      where handoffs.sent_at is not null
    )::bigint,
    (
      select count(*)
      from public.affiliate_conversions as conversions
      join public.lead_partner_handoffs as handoffs
        on handoffs.id = conversions.handoff_id
      join lead_cohort on lead_cohort.id = handoffs.lead_id
      where conversions.status = 'confirmed'
    )::bigint,
    (
      select count(*)
      from public.affiliate_conversions as conversions
      join public.lead_partner_handoffs as handoffs
        on handoffs.id = conversions.handoff_id
      join lead_cohort on lead_cohort.id = handoffs.lead_id
      where conversions.commission_status = 'paid'
    )::bigint;
end;
$$;

create function public.get_admin_analytics_paid_commissions(
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns table (
  currency text,
  amount text,
  paid_commissions bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_start_at is null
    or p_end_at is null
    or p_start_at >= p_end_at
    or p_end_at - p_start_at > interval '91 days' then
    raise exception using
      errcode = '22023',
      message = 'Invalid analytics date range.';
  end if;

  return query
  select
    conversions.commission_currency,
    sum(conversions.commission_amount)::text,
    count(*)::bigint
  from public.affiliate_conversions as conversions
  join public.lead_partner_handoffs as handoffs
    on handoffs.id = conversions.handoff_id
  join public.leads as leads
    on leads.id = handoffs.lead_id
  where leads.created_at >= p_start_at
    and leads.created_at < p_end_at
    and conversions.commission_status = 'paid'
    and conversions.commission_amount is not null
    and conversions.commission_currency is not null
  group by conversions.commission_currency
  order by conversions.commission_currency;
end;
$$;

create function public.get_admin_analytics_insurance_breakdown(
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns table (
  insurance_type text,
  form_starts bigint,
  leads bigint,
  handed_off_leads bigint,
  confirmed_conversion_leads bigint,
  paid_commission_leads bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_start_at is null
    or p_end_at is null
    or p_start_at >= p_end_at
    or p_end_at - p_start_at > interval '91 days' then
    raise exception using
      errcode = '22023',
      message = 'Invalid analytics date range.';
  end if;

  return query
  with insurance_types as (
    select values_list.insurance_type
    from (
      values ('travel'::text), ('motor'::text), ('property'::text)
    ) as values_list (insurance_type)
  ),
  form_counts as (
    select
      events.insurance_type,
      count(*)::bigint as form_starts
    from public.analytics_events as events
    where events.event_type = 'form_started'
      and events.created_at >= p_start_at
      and events.created_at < p_end_at
      and events.insurance_type is not null
    group by events.insurance_type
  ),
  lead_flags as (
    select
      leads.id,
      leads.insurance_type,
      exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        where handoffs.lead_id = leads.id
          and handoffs.sent_at is not null
      ) as handed_off,
      exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        join public.affiliate_conversions as conversions
          on conversions.handoff_id = handoffs.id
        where handoffs.lead_id = leads.id
          and conversions.status = 'confirmed'
      ) as confirmed,
      exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        join public.affiliate_conversions as conversions
          on conversions.handoff_id = handoffs.id
        where handoffs.lead_id = leads.id
          and conversions.commission_status = 'paid'
      ) as paid
    from public.leads as leads
    where leads.created_at >= p_start_at
      and leads.created_at < p_end_at
  ),
  lead_counts as (
    select
      lead_flags.insurance_type,
      count(*)::bigint as leads,
      count(*) filter (where lead_flags.handed_off)::bigint as handed_off,
      count(*) filter (where lead_flags.confirmed)::bigint as confirmed,
      count(*) filter (where lead_flags.paid)::bigint as paid
    from lead_flags
    group by lead_flags.insurance_type
  )
  select
    insurance_types.insurance_type,
    coalesce(form_counts.form_starts, 0)::bigint,
    coalesce(lead_counts.leads, 0)::bigint,
    coalesce(lead_counts.handed_off, 0)::bigint,
    coalesce(lead_counts.confirmed, 0)::bigint,
    coalesce(lead_counts.paid, 0)::bigint
  from insurance_types
  left join form_counts
    on form_counts.insurance_type = insurance_types.insurance_type
  left join lead_counts
    on lead_counts.insurance_type = insurance_types.insurance_type
  order by
    case insurance_types.insurance_type
      when 'travel' then 1
      when 'motor' then 2
      else 3
    end;
end;
$$;

create function public.get_admin_analytics_attribution_breakdown(
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns table (
  source text,
  medium text,
  campaign text,
  sessions bigint,
  form_starts bigint,
  leads bigint,
  confirmed_conversion_leads bigint,
  paid_commission_leads bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_start_at is null
    or p_end_at is null
    or p_start_at >= p_end_at
    or p_end_at - p_start_at > interval '91 days' then
    raise exception using
      errcode = '22023',
      message = 'Invalid analytics date range.';
  end if;

  return query
  with session_rows as (
    select
      sessions.id,
      case
        when sessions.utm_source is not null then sessions.utm_source
        when sessions.referrer_host is not null then sessions.referrer_host
        else 'Direct'
      end as source,
      case
        when sessions.utm_medium is not null then sessions.utm_medium
        when sessions.referrer_host is not null then 'Referral'
        else '(none)'
      end as medium,
      coalesce(sessions.utm_campaign, '(none)') as campaign
    from public.analytics_sessions as sessions
    where sessions.first_seen_at >= p_start_at
      and sessions.first_seen_at < p_end_at
  ),
  session_metrics as (
    select
      session_rows.source,
      session_rows.medium,
      session_rows.campaign,
      count(distinct session_rows.id)::bigint as sessions,
      count(events.id)::bigint as form_starts
    from session_rows
    left join public.analytics_events as events
      on events.session_id = session_rows.id
      and events.event_type = 'form_started'
      and events.created_at >= p_start_at
      and events.created_at < p_end_at
    group by session_rows.source, session_rows.medium, session_rows.campaign
  ),
  lead_rows as (
    select
      leads.id,
      case
        when attributions.lead_id is null then 'Unattributed'
        when attributions.utm_source is not null then attributions.utm_source
        when attributions.referrer_host is not null then attributions.referrer_host
        else 'Direct'
      end as source,
      case
        when attributions.lead_id is null then '(none)'
        when attributions.utm_medium is not null then attributions.utm_medium
        when attributions.referrer_host is not null then 'Referral'
        else '(none)'
      end as medium,
      case
        when attributions.lead_id is null then '(none)'
        else coalesce(attributions.utm_campaign, '(none)')
      end as campaign,
      exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        join public.affiliate_conversions as conversions
          on conversions.handoff_id = handoffs.id
        where handoffs.lead_id = leads.id
          and conversions.status = 'confirmed'
      ) as confirmed,
      exists (
        select 1
        from public.lead_partner_handoffs as handoffs
        join public.affiliate_conversions as conversions
          on conversions.handoff_id = handoffs.id
        where handoffs.lead_id = leads.id
          and conversions.commission_status = 'paid'
      ) as paid
    from public.leads as leads
    left join public.lead_attributions as attributions
      on attributions.lead_id = leads.id
    where leads.created_at >= p_start_at
      and leads.created_at < p_end_at
  ),
  lead_metrics as (
    select
      lead_rows.source,
      lead_rows.medium,
      lead_rows.campaign,
      count(*)::bigint as leads,
      count(*) filter (where lead_rows.confirmed)::bigint as confirmed,
      count(*) filter (where lead_rows.paid)::bigint as paid
    from lead_rows
    group by lead_rows.source, lead_rows.medium, lead_rows.campaign
  )
  select
    coalesce(session_metrics.source, lead_metrics.source),
    coalesce(session_metrics.medium, lead_metrics.medium),
    coalesce(session_metrics.campaign, lead_metrics.campaign),
    coalesce(session_metrics.sessions, 0)::bigint,
    coalesce(session_metrics.form_starts, 0)::bigint,
    coalesce(lead_metrics.leads, 0)::bigint,
    coalesce(lead_metrics.confirmed, 0)::bigint,
    coalesce(lead_metrics.paid, 0)::bigint
  from session_metrics
  full join lead_metrics
    on lead_metrics.source = session_metrics.source
    and lead_metrics.medium = session_metrics.medium
    and lead_metrics.campaign = session_metrics.campaign
  order by
    coalesce(lead_metrics.leads, 0) desc,
    coalesce(session_metrics.sessions, 0) desc,
    coalesce(session_metrics.source, lead_metrics.source)
  limit 50;
end;
$$;

create function public.get_admin_analytics_landing_pages(
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns table (
  path text,
  sessions bigint,
  attributed_leads bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_start_at is null
    or p_end_at is null
    or p_start_at >= p_end_at
    or p_end_at - p_start_at > interval '91 days' then
    raise exception using
      errcode = '22023',
      message = 'Invalid analytics date range.';
  end if;

  return query
  with session_metrics as (
    select
      analytics_sessions.landing_path as path,
      count(*)::bigint as sessions
    from public.analytics_sessions as analytics_sessions
    where analytics_sessions.first_seen_at >= p_start_at
      and analytics_sessions.first_seen_at < p_end_at
    group by analytics_sessions.landing_path
  ),
  lead_metrics as (
    select
      attributions.landing_path as path,
      count(*)::bigint as attributed_leads
    from public.lead_attributions as attributions
    join public.leads as leads
      on leads.id = attributions.lead_id
    where leads.created_at >= p_start_at
      and leads.created_at < p_end_at
      and attributions.landing_path is not null
    group by attributions.landing_path
  )
  select
    coalesce(session_metrics.path, lead_metrics.path),
    coalesce(session_metrics.sessions, 0)::bigint,
    coalesce(lead_metrics.attributed_leads, 0)::bigint
  from session_metrics
  full join lead_metrics on lead_metrics.path = session_metrics.path
  order by
    coalesce(session_metrics.sessions, 0) desc,
    coalesce(lead_metrics.attributed_leads, 0) desc,
    coalesce(session_metrics.path, lead_metrics.path)
  limit 15;
end;
$$;

create function public.get_admin_analytics_top_pages(
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns table (
  path text,
  page_views bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_start_at is null
    or p_end_at is null
    or p_start_at >= p_end_at
    or p_end_at - p_start_at > interval '91 days' then
    raise exception using
      errcode = '22023',
      message = 'Invalid analytics date range.';
  end if;

  return query
  select
    events.page_path,
    count(*)::bigint
  from public.analytics_events as events
  where events.event_type = 'page_view'
    and events.created_at >= p_start_at
    and events.created_at < p_end_at
    and events.page_path is not null
  group by events.page_path
  order by count(*) desc, events.page_path
  limit 15;
end;
$$;

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.lead_attributions enable row level security;

revoke all privileges on table public.analytics_sessions
  from PUBLIC, anon, authenticated, service_role;
revoke all privileges on table public.analytics_events
  from PUBLIC, anon, authenticated, service_role;
revoke all privileges on table public.lead_attributions
  from PUBLIC, anon, authenticated, service_role;

grant select, insert, update on table public.analytics_sessions
  to service_role;
grant select, insert on table public.analytics_events
  to service_role;
grant select, insert on table public.lead_attributions
  to service_role;

revoke execute on function public.record_first_party_analytics_event(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.snapshot_lead_attribution(uuid, uuid)
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.get_admin_analytics_summary(
  timestamptz,
  timestamptz
) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.get_admin_analytics_paid_commissions(
  timestamptz,
  timestamptz
) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.get_admin_analytics_insurance_breakdown(
  timestamptz,
  timestamptz
) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.get_admin_analytics_attribution_breakdown(
  timestamptz,
  timestamptz
) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.get_admin_analytics_landing_pages(
  timestamptz,
  timestamptz
) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.get_admin_analytics_top_pages(
  timestamptz,
  timestamptz
) from PUBLIC, anon, authenticated, service_role;

grant execute on function public.record_first_party_analytics_event(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to service_role;
grant execute on function public.snapshot_lead_attribution(uuid, uuid)
  to service_role;
grant execute on function public.get_admin_analytics_summary(
  timestamptz,
  timestamptz
) to service_role;
grant execute on function public.get_admin_analytics_paid_commissions(
  timestamptz,
  timestamptz
) to service_role;
grant execute on function public.get_admin_analytics_insurance_breakdown(
  timestamptz,
  timestamptz
) to service_role;
grant execute on function public.get_admin_analytics_attribution_breakdown(
  timestamptz,
  timestamptz
) to service_role;
grant execute on function public.get_admin_analytics_landing_pages(
  timestamptz,
  timestamptz
) to service_role;
grant execute on function public.get_admin_analytics_top_pages(
  timestamptz,
  timestamptz
) to service_role;

commit;
