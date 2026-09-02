begin;

alter table public.leads
  drop constraint if exists leads_insurance_type_check,
  drop constraint if exists leads_core_insurance_type_check;
alter table public.leads
  add constraint leads_core_insurance_type_check
  check (insurance_type in ('travel', 'motor', 'property', 'health')) not valid;
alter table public.leads validate constraint leads_core_insurance_type_check;

alter table public.partner_capabilities
  drop constraint if exists partner_capabilities_insurance_type_check;
alter table public.partner_capabilities
  add constraint partner_capabilities_insurance_type_check
  check (insurance_type in ('travel', 'motor', 'property', 'health')) not valid;
alter table public.partner_capabilities validate constraint partner_capabilities_insurance_type_check;

alter table public.partner_referral_destinations
  drop constraint if exists partner_referral_destinations_insurance_type_check;
alter table public.partner_referral_destinations
  add constraint partner_referral_destinations_insurance_type_check
  check (insurance_type in ('travel', 'motor', 'property', 'health')) not valid;
alter table public.partner_referral_destinations validate constraint partner_referral_destinations_insurance_type_check;

alter table public.partner_referral_clicks
  drop constraint if exists partner_referral_clicks_insurance_type_check;
alter table public.partner_referral_clicks
  add constraint partner_referral_clicks_insurance_type_check
  check (insurance_type in ('travel', 'motor', 'property', 'health')) not valid;
alter table public.partner_referral_clicks validate constraint partner_referral_clicks_insurance_type_check;

alter table public.policy_comparisons
  drop constraint if exists policy_comparisons_insurance_type_check;
alter table public.policy_comparisons
  add constraint policy_comparisons_insurance_type_check
  check (insurance_type in ('travel', 'motor', 'property', 'health')) not valid;
alter table public.policy_comparisons validate constraint policy_comparisons_insurance_type_check;

alter table public.analytics_events
  drop constraint if exists analytics_events_insurance_type_check;
alter table public.analytics_events
  add constraint analytics_events_insurance_type_check
  check (insurance_type is null or insurance_type in ('travel', 'motor', 'property', 'health')) not valid;
alter table public.analytics_events validate constraint analytics_events_insurance_type_check;

alter table public.blog_posts
  drop constraint if exists blog_posts_category_check;
alter table public.blog_posts
  add constraint blog_posts_category_check
  check (category in ('travel', 'motor', 'property', 'health', 'general')) not valid;
alter table public.blog_posts validate constraint blog_posts_category_check;

alter table public.policy_upload_sessions
  drop constraint if exists policy_upload_sessions_category_check,
  drop constraint if exists policy_upload_sessions_temporary_path_check,
  drop constraint if exists policy_upload_sessions_final_path_check;
alter table public.policy_upload_sessions
  add constraint policy_upload_sessions_category_check
    check (category in ('motor', 'property', 'health')) not valid,
  add constraint policy_upload_sessions_temporary_path_check
    check (
      temporary_path ~ '^_pending/(motor|property|health)/[0-9a-f]{32}$'
      and split_part(temporary_path, '/', 2) = category
    ) not valid,
  add constraint policy_upload_sessions_final_path_check
    check (
      final_path is null
      or (
        final_path ~ '^(motor|property|health)/[0-9a-f]{32}\.(pdf|jpg|png)$'
        and split_part(final_path, '/', 1) = category
      )
    ) not valid;
alter table public.policy_upload_sessions validate constraint policy_upload_sessions_category_check;
alter table public.policy_upload_sessions validate constraint policy_upload_sessions_temporary_path_check;
alter table public.policy_upload_sessions validate constraint policy_upload_sessions_final_path_check;

create or replace function public.get_admin_analytics_insurance_breakdown(
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns table(
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
  if p_start_at is null or p_end_at is null or p_start_at >= p_end_at
    or p_end_at - p_start_at > interval '91 days' then
    raise exception using errcode='22023', message='Invalid analytics date range.';
  end if;

  return query
  with insurance_types as (
    select value.insurance_type
    from (values
      ('travel'::text),
      ('motor'::text),
      ('property'::text),
      ('health'::text)
    ) as value(insurance_type)
  ),
  form_counts as (
    select event.insurance_type, count(*)::bigint as form_starts
    from public.analytics_events as event
    where event.event_type = 'form_started'
      and event.created_at >= p_start_at
      and event.created_at < p_end_at
      and event.insurance_type is not null
    group by event.insurance_type
  ),
  lead_flags as (
    select
      lead.id,
      lead.insurance_type,
      exists (
        select 1 from public.lead_partner_handoffs as handoff
        where handoff.lead_id = lead.id and handoff.sent_at is not null
      ) as handed_off,
      exists (
        select 1
        from public.lead_partner_handoffs as handoff
        join public.affiliate_conversions as conversion on conversion.handoff_id = handoff.id
        where handoff.lead_id = lead.id and conversion.status = 'confirmed'
      ) as confirmed,
      exists (
        select 1
        from public.lead_partner_handoffs as handoff
        join public.affiliate_conversions as conversion on conversion.handoff_id = handoff.id
        where handoff.lead_id = lead.id and conversion.commission_status = 'paid'
      ) as paid
    from public.leads as lead
    where lead.created_at >= p_start_at and lead.created_at < p_end_at
  ),
  lead_counts as (
    select
      flag.insurance_type,
      count(*)::bigint as leads,
      count(*) filter (where flag.handed_off)::bigint as handed_off,
      count(*) filter (where flag.confirmed)::bigint as confirmed,
      count(*) filter (where flag.paid)::bigint as paid
    from lead_flags as flag
    group by flag.insurance_type
  )
  select
    kind.insurance_type,
    coalesce(forms.form_starts, 0)::bigint,
    coalesce(counts.leads, 0)::bigint,
    coalesce(counts.handed_off, 0)::bigint,
    coalesce(counts.confirmed, 0)::bigint,
    coalesce(counts.paid, 0)::bigint
  from insurance_types as kind
  left join form_counts as forms on forms.insurance_type = kind.insurance_type
  left join lead_counts as counts on counts.insurance_type = kind.insurance_type
  order by case kind.insurance_type
    when 'travel' then 1
    when 'motor' then 2
    when 'property' then 3
    when 'health' then 4
  end;
end;
$$;

commit;
