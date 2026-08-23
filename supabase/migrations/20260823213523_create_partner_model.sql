begin;

-- Known existing database state: public.leads already stores insurance requests
-- with the statuses new, reviewing, sent_to_partner, completed, and rejected.
-- This migration intentionally does not alter public.leads or its status workflow.

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  partner_type text not null,
  status text not null default 'active',
  website_url text,
  contact_email text,
  handoff_method text not null default 'manual',
  affiliate_reference text,
  notes text,
  constraint partners_name_not_blank
    check (char_length(btrim(name)) > 0),
  constraint partners_partner_type_check
    check (
      partner_type in (
        'insurer',
        'broker',
        'intermediary',
        'affiliate_network',
        'other'
      )
    ),
  constraint partners_status_check
    check (status in ('active', 'inactive')),
  constraint partners_handoff_method_check
    check (handoff_method in ('manual', 'email', 'portal', 'api'))
);

create table public.partner_capabilities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  partner_id uuid not null,
  insurance_type text not null,
  country_code text not null,
  status text not null default 'active',
  constraint partner_capabilities_partner_id_fkey
    foreign key (partner_id)
    references public.partners (id)
    on delete cascade,
  constraint partner_capabilities_insurance_type_check
    check (insurance_type in ('travel', 'motor', 'property')),
  constraint partner_capabilities_country_code_check
    check (
      char_length(country_code) between 2 and 3
      and country_code = upper(country_code)
      and country_code ~ '^[A-Z]{2,3}$'
    ),
  constraint partner_capabilities_status_check
    check (status in ('active', 'inactive')),
  constraint partner_capabilities_partner_insurance_country_key
    unique (partner_id, insurance_type, country_code)
);

create index partners_status_idx
  on public.partners (status);

create index partner_capabilities_partner_id_idx
  on public.partner_capabilities (partner_id);

create index partner_capabilities_routing_idx
  on public.partner_capabilities (
    insurance_type,
    country_code,
    status
  );

create function public.set_partner_model_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger partners_set_updated_at
before update on public.partners
for each row
execute function public.set_partner_model_updated_at();

alter table public.partners enable row level security;
alter table public.partner_capabilities enable row level security;

-- No client policies are created. These tables are intended for trusted
-- administrative and server-side access only.
revoke all privileges on table public.partners from anon, authenticated;
revoke all privileges on table public.partner_capabilities from anon, authenticated;
revoke all privileges on function public.set_partner_model_updated_at()
  from public, anon, authenticated;

commit;
