begin;

create table public.partner_referral_destinations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  partner_id uuid not null references public.partners (id) on delete restrict,
  insurance_type text not null check (insurance_type in ('travel', 'motor', 'property')),
  country_code text,
  status text not null default 'draft' check (status in ('draft', 'active', 'inactive')),
  destination_url text not null,
  customer_link_label text not null default 'Continue to partner',
  tracking_parameter_name text,
  external_campaign_reference text,
  internal_note text,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  constraint partner_referral_destinations_country_check check (
    country_code is null or (
      char_length(country_code) between 2 and 3
      and country_code = upper(country_code)
      and country_code ~ '^[A-Z]{2,3}$'
    )
  ),
  constraint partner_referral_destinations_url_length_check
    check (char_length(destination_url) between 1 and 2000),
  constraint partner_referral_destinations_label_check
    check (char_length(btrim(customer_link_label)) between 1 and 80),
  constraint partner_referral_destinations_tracking_check check (
    tracking_parameter_name is null
    or tracking_parameter_name ~ '^[A-Za-z0-9_-]{1,50}$'
  ),
  constraint partner_referral_destinations_campaign_length_check check (
    external_campaign_reference is null
    or char_length(external_campaign_reference) <= 200
  ),
  constraint partner_referral_destinations_note_length_check
    check (internal_note is null or char_length(internal_note) <= 2000)
);

create table public.partner_referral_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  token_hash text not null unique,
  destination_id uuid not null references public.partner_referral_destinations (id) on delete restrict,
  lead_id uuid references public.leads (id) on delete set null,
  handoff_id uuid references public.lead_partner_handoffs (id) on delete set null,
  comparison_id uuid references public.policy_comparisons (id) on delete set null,
  comparison_share_id uuid references public.policy_comparison_shares (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  used_count integer not null default 0 check (used_count >= 0),
  last_used_at timestamptz,
  constraint partner_referral_links_hash_check
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint partner_referral_links_expiry_check
    check (expires_at > created_at),
  constraint partner_referral_links_usage_check check (
    (used_count = 0 and last_used_at is null)
    or (used_count > 0 and last_used_at is not null)
  )
);

create table public.partner_referral_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  destination_id uuid not null references public.partner_referral_destinations (id) on delete restrict,
  partner_id uuid not null references public.partners (id) on delete restrict,
  insurance_type text not null check (insurance_type in ('travel', 'motor', 'property')),
  lead_id uuid references public.leads (id) on delete set null,
  handoff_id uuid references public.lead_partner_handoffs (id) on delete set null,
  comparison_id uuid references public.policy_comparisons (id) on delete set null,
  comparison_share_id uuid references public.policy_comparison_shares (id) on delete set null,
  click_reference uuid not null default gen_random_uuid() unique,
  redirect_status text not null default 'created' check (redirect_status in ('created', 'redirected', 'blocked')),
  redirected_at timestamptz,
  internal_note text,
  constraint partner_referral_clicks_redirected_at_check check (
    (redirect_status = 'created' and redirected_at is null)
    or (redirect_status = 'blocked' and redirected_at is null)
    or (redirect_status = 'redirected' and redirected_at is not null)
  ),
  constraint partner_referral_clicks_note_length_check
    check (internal_note is null or char_length(internal_note) <= 500)
);

create index partner_referral_destinations_partner_status_idx
  on public.partner_referral_destinations (partner_id, status);
create index partner_referral_destinations_insurance_status_idx
  on public.partner_referral_destinations (insurance_type, status);
create unique index partner_referral_destinations_active_route_idx
  on public.partner_referral_destinations (
    partner_id,
    insurance_type,
    coalesce(country_code, '')
  ) where status = 'active';
create index partner_referral_links_destination_created_idx
  on public.partner_referral_links (destination_id, created_at desc);
create index partner_referral_links_active_expiry_idx
  on public.partner_referral_links (expires_at) where revoked_at is null;
create index partner_referral_clicks_partner_created_idx
  on public.partner_referral_clicks (partner_id, created_at desc);
create index partner_referral_clicks_destination_created_idx
  on public.partner_referral_clicks (destination_id, created_at desc);
create index partner_referral_clicks_insurance_created_idx
  on public.partner_referral_clicks (insurance_type, created_at desc);
create index partner_referral_clicks_handoff_idx
  on public.partner_referral_clicks (handoff_id) where handoff_id is not null;

create function public.is_safe_partner_referral_url(p_url text)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select p_url is not null
    and char_length(p_url) between 1 and 2000
    and p_url ~* '^https://[^/?#[:space:]]+(?::[0-9]+)?(?:[/?][^#]*)?$'
    and p_url !~ '#'
    and p_url !~* '^https://[^/?#]*@'
    and p_url !~* '^https://(?:localhost|[^/?#]+\.(?:localhost|local|internal))(?::[0-9]+)?(?:[/?]|$)'
    and p_url !~* '^https://(?:0\.0\.0\.0|127(?:\.[0-9]{1,3}){3}|10(?:\.[0-9]{1,3}){3}|169\.254(?:\.[0-9]{1,3}){2}|192\.168(?:\.[0-9]{1,3}){2}|172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2}|100\.(?:6[4-9]|[789][0-9]|1[01][0-9]|12[0-7])(?:\.[0-9]{1,3}){2})(?::[0-9]+)?(?:[/?]|$)'
    and p_url !~* '^https://\[(?:::|::1|f[cd][0-9a-f:]*|fe[89ab][0-9a-f:]*)\](?::[0-9]+)?(?:[/?]|$)'
    and p_url !~* '[?&](?:api_key|apikey|secret|password|token|access_token|authorization|client_secret)='
    and p_url !~* '(?:\{\{|\}\}|\$\{|<%|%>)'
    and p_url !~* '(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\bBearer[[:space:]]+[A-Za-z0-9._~-]+|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)'
$$;

create function public.validate_partner_referral_destination()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_partner_status text;
begin
  new.destination_url := btrim(new.destination_url);
  new.customer_link_label := btrim(new.customer_link_label);
  new.country_code := nullif(upper(btrim(new.country_code)), '');
  new.tracking_parameter_name := nullif(btrim(new.tracking_parameter_name), '');
  new.external_campaign_reference := nullif(btrim(new.external_campaign_reference), '');
  new.internal_note := nullif(btrim(new.internal_note), '');

  if not public.is_safe_partner_referral_url(new.destination_url) then
    raise exception 'Referral destination URL is not permitted.';
  end if;
  if new.customer_link_label ~* '(buy[[:space:]]+best|recommended|best[[:space:]]+offer|winner|best[[:space:]]+value)' then
    raise exception 'Referral customer link label is not neutral.';
  end if;
  if coalesce(new.external_campaign_reference, '') ~* '(api[_ -]?key|password|secret|access[_ -]?token|refresh[_ -]?token|credential)[[:space:]]*[:=]'
    or coalesce(new.internal_note, '') ~* '(api[_ -]?key|password|secret|access[_ -]?token|refresh[_ -]?token|credential)[[:space:]]*[:=]' then
    raise exception 'Referral configuration must not contain credentials.';
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id or new.created_at <> old.created_at
      or new.partner_id <> old.partner_id
      or new.created_by is distinct from old.created_by then
      raise exception 'Immutable referral destination fields cannot be changed.';
    end if;
    if old.status = 'active' and (
      new.destination_url is distinct from old.destination_url
      or new.insurance_type is distinct from old.insurance_type
      or new.country_code is distinct from old.country_code
      or new.customer_link_label is distinct from old.customer_link_label
      or new.tracking_parameter_name is distinct from old.tracking_parameter_name
      or new.external_campaign_reference is distinct from old.external_campaign_reference
    ) then
      raise exception 'Deactivate a referral destination before editing it.';
    end if;
  end if;

  if new.status = 'active' then
    select partners.status into v_partner_status
    from public.partners as partners
    where partners.id = new.partner_id
    for share;
    if not found or v_partner_status <> 'active' then
      raise exception 'Referral partner must be active.';
    end if;
    if not exists (
      select 1 from public.partner_capabilities as capabilities
      where capabilities.partner_id = new.partner_id
        and capabilities.insurance_type = new.insurance_type
        and capabilities.status = 'active'
    ) then
      raise exception 'Referral partner requires an active matching capability.';
    end if;
  end if;

  if tg_op = 'UPDATE' and new is distinct from old then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create function public.protect_partner_referral_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'Referral records cannot be hard-deleted.';
end;
$$;

create function public.protect_partner_referral_link()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.id <> old.id or new.created_at <> old.created_at
    or new.expires_at <> old.expires_at or new.token_hash <> old.token_hash
    or new.destination_id <> old.destination_id
    or new.lead_id is distinct from old.lead_id
    or new.handoff_id is distinct from old.handoff_id
    or new.comparison_id is distinct from old.comparison_id
    or new.comparison_share_id is distinct from old.comparison_share_id
    or new.created_by is distinct from old.created_by then
    raise exception 'Referral link relationship fields are immutable.';
  end if;
  if old.revoked_at is not null and new.revoked_at is distinct from old.revoked_at then
    raise exception 'Referral link revocation is permanent.';
  end if;
  if new.used_count < old.used_count then
    raise exception 'Referral link usage cannot decrease.';
  end if;
  return new;
end;
$$;

create function public.protect_partner_referral_click()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.id <> old.id or new.created_at <> old.created_at
    or new.destination_id <> old.destination_id or new.partner_id <> old.partner_id
    or new.insurance_type <> old.insurance_type
    or new.lead_id is distinct from old.lead_id
    or new.handoff_id is distinct from old.handoff_id
    or new.comparison_id is distinct from old.comparison_id
    or new.comparison_share_id is distinct from old.comparison_share_id
    or new.click_reference <> old.click_reference
    or new.internal_note is distinct from old.internal_note then
    raise exception 'Referral click audit fields are immutable.';
  end if;
  if old.redirect_status <> 'created' or new.redirect_status not in ('redirected', 'blocked') then
    raise exception 'Invalid referral click transition.';
  end if;
  return new;
end;
$$;

create trigger partner_referral_destinations_10_validate
before insert or update on public.partner_referral_destinations
for each row execute function public.validate_partner_referral_destination();
create trigger partner_referral_destinations_90_reject_delete
before delete on public.partner_referral_destinations
for each row execute function public.protect_partner_referral_delete();
create trigger partner_referral_links_10_protect
before update on public.partner_referral_links
for each row execute function public.protect_partner_referral_link();
create trigger partner_referral_links_90_reject_delete
before delete on public.partner_referral_links
for each row execute function public.protect_partner_referral_delete();
create trigger partner_referral_clicks_10_protect
before update on public.partner_referral_clicks
for each row execute function public.protect_partner_referral_click();
create trigger partner_referral_clicks_90_reject_delete
before delete on public.partner_referral_clicks
for each row execute function public.protect_partner_referral_delete();

create function public.create_partner_referral_destination(
  p_partner_id uuid,
  p_insurance_type text,
  p_country_code text,
  p_destination_url text,
  p_customer_link_label text,
  p_tracking_parameter_name text,
  p_external_campaign_reference text,
  p_internal_note text,
  p_actor_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare v_id uuid;
begin
  insert into public.partner_referral_destinations (
    partner_id, insurance_type, country_code, status, destination_url,
    customer_link_label, tracking_parameter_name, external_campaign_reference,
    internal_note, created_by, updated_by
  ) values (
    p_partner_id, p_insurance_type, p_country_code, 'draft', p_destination_url,
    p_customer_link_label, p_tracking_parameter_name, p_external_campaign_reference,
    p_internal_note, p_actor_id, p_actor_id
  ) returning id into v_id;
  return v_id;
end;
$$;

create function public.update_partner_referral_destination(
  p_destination_id uuid,
  p_insurance_type text,
  p_country_code text,
  p_destination_url text,
  p_customer_link_label text,
  p_tracking_parameter_name text,
  p_external_campaign_reference text,
  p_internal_note text,
  p_actor_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.partner_referral_destinations
  set insurance_type = p_insurance_type,
      country_code = p_country_code,
      destination_url = p_destination_url,
      customer_link_label = p_customer_link_label,
      tracking_parameter_name = p_tracking_parameter_name,
      external_campaign_reference = p_external_campaign_reference,
      internal_note = p_internal_note,
      updated_by = p_actor_id
  where id = p_destination_id and status in ('draft', 'inactive');
  return found;
end;
$$;

create function public.change_partner_referral_destination_status(
  p_destination_id uuid,
  p_status text,
  p_actor_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare v_current text;
begin
  if p_status not in ('active', 'inactive') then
    raise exception 'Invalid referral destination status.';
  end if;
  select status into v_current from public.partner_referral_destinations
  where id = p_destination_id for update;
  if not found then return false; end if;
  if v_current = p_status then return true; end if;
  update public.partner_referral_destinations
  set status = p_status, updated_by = p_actor_id
  where id = p_destination_id;
  return true;
end;
$$;

create function public.create_partner_referral_link(
  p_destination_id uuid,
  p_token_hash text,
  p_expiry_days integer,
  p_lead_id uuid,
  p_handoff_id uuid,
  p_comparison_id uuid,
  p_comparison_share_id uuid,
  p_actor_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_destination public.partner_referral_destinations%rowtype;
  v_partner_status text;
  v_lead_type text;
  v_handoff_lead uuid;
  v_handoff_partner uuid;
  v_comparison_lead uuid;
  v_comparison_type text;
  v_comparison_status text;
  v_share_comparison uuid;
  v_id uuid;
begin
  if p_expiry_days not in (1, 7, 14, 30) or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid referral link settings.';
  end if;
  select destinations.* into v_destination
  from public.partner_referral_destinations as destinations
  where destinations.id = p_destination_id
  for share;
  if not found or v_destination.status <> 'active' then
    raise exception 'Referral destination is not active.';
  end if;
  select status into v_partner_status from public.partners
  where id = v_destination.partner_id for share;
  if not found or v_partner_status <> 'active' or not exists (
    select 1 from public.partner_capabilities
    where partner_id = v_destination.partner_id
      and insurance_type = v_destination.insurance_type
      and status = 'active'
  ) then
    raise exception 'Referral partner is unavailable.';
  end if;

  if p_lead_id is not null then
    select insurance_type into v_lead_type from public.leads where id = p_lead_id;
    if not found or v_lead_type <> v_destination.insurance_type then
      raise exception 'Referral lead does not match destination.';
    end if;
  end if;
  if p_handoff_id is not null then
    select lead_id, partner_id into v_handoff_lead, v_handoff_partner
    from public.lead_partner_handoffs where id = p_handoff_id;
    if not found or v_handoff_partner <> v_destination.partner_id
      or (p_lead_id is not null and v_handoff_lead <> p_lead_id) then
      raise exception 'Referral handoff does not match destination.';
    end if;
  end if;
  if p_comparison_id is not null then
    select lead_id, insurance_type, status
    into v_comparison_lead, v_comparison_type, v_comparison_status
    from public.policy_comparisons where id = p_comparison_id;
    if not found or v_comparison_type <> v_destination.insurance_type
      or v_comparison_status <> 'ready'
      or (p_lead_id is not null and v_comparison_lead <> p_lead_id) then
      raise exception 'Referral comparison does not match destination.';
    end if;
  end if;
  if p_comparison_share_id is not null then
    select comparison_id into v_share_comparison
    from public.policy_comparison_shares
    where id = p_comparison_share_id and revoked_at is null and expires_at > now();
    if not found or p_comparison_id is null or v_share_comparison <> p_comparison_id then
      raise exception 'Referral comparison share is unavailable.';
    end if;
  end if;

  insert into public.partner_referral_links (
    expires_at, token_hash, destination_id, lead_id, handoff_id,
    comparison_id, comparison_share_id, created_by
  ) values (
    now() + make_interval(days => p_expiry_days), p_token_hash, p_destination_id,
    p_lead_id, p_handoff_id, p_comparison_id, p_comparison_share_id, p_actor_id
  ) returning id into v_id;
  return v_id;
end;
$$;

create function public.revoke_partner_referral_link(p_link_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.partner_referral_links
  set revoked_at = now()
  where id = p_link_id and revoked_at is null;
  return found;
end;
$$;

create function public.consume_partner_referral_link(p_token_hash text)
returns table(destination_url text, tracking_parameter_name text, click_reference uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_link public.partner_referral_links%rowtype;
  v_destination public.partner_referral_destinations%rowtype;
  v_partner_status text;
  v_click_id uuid;
  v_click_reference uuid;
begin
  if p_token_hash !~ '^[0-9a-f]{64}$' then return; end if;
  select links.* into v_link from public.partner_referral_links as links
  where links.token_hash = p_token_hash for update;
  if not found or v_link.revoked_at is not null or v_link.expires_at <= now() then return; end if;
  select destinations.* into v_destination
  from public.partner_referral_destinations as destinations
  where destinations.id = v_link.destination_id for share;
  if not found or v_destination.status <> 'active'
    or not public.is_safe_partner_referral_url(v_destination.destination_url) then return; end if;
  select status into v_partner_status from public.partners
  where id = v_destination.partner_id for share;
  if not found or v_partner_status <> 'active' or not exists (
    select 1 from public.partner_capabilities
    where partner_id = v_destination.partner_id
      and insurance_type = v_destination.insurance_type
      and status = 'active'
  ) then return; end if;

  insert into public.partner_referral_clicks (
    destination_id, partner_id, insurance_type, lead_id, handoff_id,
    comparison_id, comparison_share_id
  ) values (
    v_destination.id, v_destination.partner_id, v_destination.insurance_type,
    v_link.lead_id, v_link.handoff_id, v_link.comparison_id,
    v_link.comparison_share_id
  ) returning id, partner_referral_clicks.click_reference
    into v_click_id, v_click_reference;
  update public.partner_referral_clicks
  set redirect_status = 'redirected', redirected_at = now()
  where id = v_click_id and redirect_status = 'created';
  update public.partner_referral_links
  set used_count = used_count + 1, last_used_at = now()
  where id = v_link.id;
  return query select v_destination.destination_url,
    v_destination.tracking_parameter_name, v_click_reference;
end;
$$;

alter table public.partner_referral_destinations enable row level security;
alter table public.partner_referral_links enable row level security;
alter table public.partner_referral_clicks enable row level security;

revoke all privileges on table public.partner_referral_destinations from PUBLIC, anon, authenticated, service_role;
revoke all privileges on table public.partner_referral_links from PUBLIC, anon, authenticated, service_role;
revoke all privileges on table public.partner_referral_clicks from PUBLIC, anon, authenticated, service_role;
grant select, insert, update on table public.partner_referral_destinations to service_role;
grant select, insert, update on table public.partner_referral_links to service_role;
grant select, insert, update on table public.partner_referral_clicks to service_role;

revoke execute on function public.is_safe_partner_referral_url(text) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.validate_partner_referral_destination() from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.protect_partner_referral_delete() from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.protect_partner_referral_link() from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.protect_partner_referral_click() from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.create_partner_referral_destination(uuid, text, text, text, text, text, text, text, uuid) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.update_partner_referral_destination(uuid, text, text, text, text, text, text, text, uuid) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.change_partner_referral_destination_status(uuid, text, uuid) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.create_partner_referral_link(uuid, text, integer, uuid, uuid, uuid, uuid, uuid) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.revoke_partner_referral_link(uuid) from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.consume_partner_referral_link(text) from PUBLIC, anon, authenticated, service_role;

grant execute on function public.create_partner_referral_destination(uuid, text, text, text, text, text, text, text, uuid) to service_role;
grant execute on function public.is_safe_partner_referral_url(text) to service_role;
grant execute on function public.update_partner_referral_destination(uuid, text, text, text, text, text, text, text, uuid) to service_role;
grant execute on function public.change_partner_referral_destination_status(uuid, text, uuid) to service_role;
grant execute on function public.create_partner_referral_link(uuid, text, integer, uuid, uuid, uuid, uuid, uuid) to service_role;
grant execute on function public.revoke_partner_referral_link(uuid) to service_role;
grant execute on function public.consume_partner_referral_link(text) to service_role;

commit;
