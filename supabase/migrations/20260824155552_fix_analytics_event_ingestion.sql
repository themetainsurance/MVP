begin;

create or replace function public.record_first_party_analytics_event(
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
  set last_seen_at = greatest(sessions.last_seen_at, now());

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

commit;
