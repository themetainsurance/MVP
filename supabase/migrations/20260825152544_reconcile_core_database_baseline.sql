begin;

-- Reconcile the application-owned core that predates the tracked historical
-- migrations. This creates no application rows and preserves existing rows,
-- identifiers, timestamps, status history, and policy document paths.
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
    check (insurance_type in ('travel', 'motor', 'property')),
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

-- Nullable application fields can be added without rewriting or inventing
-- historical customer data. Required fields are verified below instead of
-- being backfilled with guessed values.
alter table public.leads
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists preferred_contact text,
  add column if not exists policy_document_path text;

do $$
declare
  incompatible_columns text;
begin
  with expected (column_name, type_name) as (
    values
      ('id', 'uuid'),
      ('created_at', 'timestamp with time zone'),
      ('insurance_type', 'text'),
      ('full_name', 'text'),
      ('email', 'text'),
      ('phone', 'text'),
      ('preferred_contact', 'text'),
      ('status', 'text'),
      ('source', 'text'),
      ('policy_document_path', 'text'),
      ('consent', 'boolean'),
      ('details', 'jsonb')
  )
  select string_agg(
    format('%I expected %s', expected.column_name, expected.type_name),
    ', '
    order by expected.column_name
  )
  into incompatible_columns
  from expected
  where not exists (
    select 1
    from pg_catalog.pg_attribute attribute
    join pg_catalog.pg_class relation
      on relation.oid = attribute.attrelid
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'leads'
      and relation.relkind in ('r', 'p')
      and attribute.attname = expected.column_name
      and not attribute.attisdropped
      and pg_catalog.format_type(
        attribute.atttypid,
        attribute.atttypmod
      ) = expected.type_name
  );

  if incompatible_columns is not null then
    raise exception
      'public.leads requires manual schema review before reconciliation: %',
      incompatible_columns;
  end if;

  if exists (
    select 1
    from public.leads
    where id is null
      or created_at is null
      or insurance_type is null
      or status is null
      or source is null
      or consent is null
      or details is null
  ) then
    raise exception
      'public.leads contains NULL values in required columns; no data was changed';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    join pg_catalog.pg_class relation
      on relation.oid = constraint_row.conrelid
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'leads'
      and constraint_row.contype = 'p'
      and constraint_row.conkey <> array[
        (
          select attribute.attnum
          from pg_catalog.pg_attribute attribute
          where attribute.attrelid = relation.oid
            and attribute.attname = 'id'
            and not attribute.attisdropped
        )::smallint
      ]
  ) then
    raise exception
      'public.leads has a primary key other than id; no schema was changed';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    join pg_catalog.pg_class relation
      on relation.oid = constraint_row.conrelid
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'leads'
      and constraint_row.contype = 'p'
  ) then
    alter table public.leads add primary key (id);
  end if;
end;
$$;

alter table public.leads
  alter column id set default gen_random_uuid(),
  alter column id set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column insurance_type set not null,
  alter column status set default 'new',
  alter column status set not null,
  alter column source set default 'website',
  alter column source set not null,
  alter column consent set not null,
  alter column details set default '{}'::jsonb,
  alter column details set not null;

-- NOT VALID preserves migration compatibility with unverified historical rows.
-- PostgreSQL still enforces these contract constraints for new writes. Run the
-- verification queries in the recovery runbook before separately validating
-- them in production.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.leads'::regclass
      and conname = 'leads_core_insurance_type_check'
  ) then
    alter table public.leads
      add constraint leads_core_insurance_type_check
      check (insurance_type in ('travel', 'motor', 'property')) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.leads'::regclass
      and conname = 'leads_core_status_check'
  ) then
    alter table public.leads
      add constraint leads_core_status_check
      check (
        status in (
          'new',
          'reviewing',
          'sent_to_partner',
          'completed',
          'rejected'
        )
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.leads'::regclass
      and conname = 'leads_core_details_object_check'
  ) then
    alter table public.leads
      add constraint leads_core_details_object_check
      check (jsonb_typeof(details) = 'object') not valid;
  end if;
end;
$$;

alter table public.leads enable row level security;

revoke all privileges on table public.leads
  from PUBLIC, anon, authenticated, service_role;
grant select, insert, update on table public.leads to service_role;

-- The Admin UI reads, creates, and updates partners and capabilities. Their
-- inactive lifecycle replaces hard deletion, so DELETE remains unavailable.
alter table public.partners enable row level security;
alter table public.partner_capabilities enable row level security;

revoke all privileges on table public.partners
  from PUBLIC, anon, authenticated, service_role;
revoke all privileges on table public.partner_capabilities
  from PUBLIC, anon, authenticated, service_role;
grant select, insert, update on table public.partners to service_role;
grant select, insert, update on table public.partner_capabilities to service_role;

-- This is a trigger-only helper. Direct execution is unnecessary for every
-- application role, including service_role.
revoke execute on function public.set_partner_model_updated_at()
  from PUBLIC, anon, authenticated, service_role;

-- Reconcile bucket metadata only. Existing Storage objects are neither read,
-- moved, updated, nor deleted, and no storage.objects policy is introduced.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'policy-documents',
  'policy-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

comment on table public.leads is
  'Server-managed insurance requests. Browser roles have no direct table access.';

commit;
