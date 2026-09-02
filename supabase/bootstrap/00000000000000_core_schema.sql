begin;

-- Fresh-environment prerequisite for the immutable historical migration chain.
-- Apply this file once, before supabase/migrations, only in a new empty
-- Supabase environment. The current reconciliation migration remains the
-- authoritative hardening step for existing environments.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  insurance_type text not null,
  full_name text,
  email text,
  phone text,
  preferred_contact text,
  status text not null default 'new',
  source text not null default 'website',
  policy_document_path text,
  consent boolean not null,
  details jsonb not null default '{}'::jsonb,
  constraint leads_core_insurance_type_check
    check (insurance_type in ('travel', 'motor', 'property', 'health')),
  constraint leads_core_status_check
    check (
      status in (
        'new',
        'reviewing',
        'sent_to_partner',
        'completed',
        'rejected'
      )
    ),
  constraint leads_core_details_object_check
    check (jsonb_typeof(details) = 'object')
);

alter table public.leads enable row level security;

-- Lead submission and administration are server-side only. No browser policy
-- is created, and DELETE is deliberately unavailable to service_role.
revoke all privileges on table public.leads
  from PUBLIC, anon, authenticated, service_role;
grant select, insert, update on table public.leads to service_role;

comment on table public.leads is
  'Server-managed insurance requests. Browser roles have no direct table access.';

commit;
