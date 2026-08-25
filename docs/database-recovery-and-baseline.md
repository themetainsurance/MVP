# Database baseline and recovery runbook

This document defines the repository source of truth for The Meta Insurance
application database. It is an operational runbook, not evidence that any
production backup, retention, or point-in-time recovery feature is enabled.
Production-console and provider-plan checks are marked **MANUAL / EXTERNAL
CHECK**.

## Source-of-truth model

- `supabase/bootstrap/00000000000000_core_schema.sql` is a fresh-environment
  prerequisite. It creates only `public.leads`, the object assumed by the
  immutable historical migration chain.
- `supabase/migrations/` remains the ordered production migration history.
- `20260825152544_reconcile_core_database_baseline.sql` is the forward-only,
  production-safe reconciliation step. It hardens the lead and partner grants
  and reconciles the private `policy-documents` bucket metadata.
- The Git repository records schema intent and migration history. It does not
  contain customer data, Storage objects, or deployed secrets.

The bootstrap is intentionally outside `supabase/migrations`. Adding only a
current migration cannot fix a clean replay because
`20260824001419_create_lead_status_history.sql` references `public.leads`
before the current migration can run. The historical files are already applied
and must not be edited or silently reordered.

## Chronological dependency map

| Order | Migration | Creates | Important prerequisites |
| --- | --- | --- | --- |
| 0 | Fresh bootstrap | `leads` | Compatible Supabase project; `gen_random_uuid()` supplied by supported Postgres |
| 1 | Partner model | `partners`, `partner_capabilities` | None from the app schema |
| 2 | Lead status history | `lead_status_history` and lead triggers/RPC | `leads` |
| 3 | Partner handoffs | `lead_partner_handoffs`, `lead_partner_handoff_history` | `leads`, partners, capabilities, status RPC |
| 4 | Affiliate conversions | `affiliate_conversions`, `affiliate_conversion_history` | handoffs, partners, status RPC |
| 5 | Admin access | `admin_users` | Supabase-owned `auth.users` |
| 6 | Blog CMS | `blog_posts`, `blog_post_revisions`, `blog-images` bucket | Supabase Storage schema |
| 7 | Analytics | `analytics_sessions`, `analytics_events`, `lead_attributions` | leads, handoffs, conversions |
| 8 | Analytics ingestion fix | replacement analytics RPC | analytics tables |
| 9 | Policy comparisons | comparisons, options, shares | leads, partners, capabilities, handoffs, `auth.users` |
| 10 | Partner referrals | destinations, links, clicks | partners, capabilities, leads, handoffs, comparisons, `auth.users` |
| 11 | Policy uploads | `policy_upload_sessions` and RPCs | Supabase Storage used by the server; no customer PII foreign key |
| 12 | Core reconciliation | leads/grants/bucket metadata reconciliation | all historical migrations |

The later foreign keys and their existing delete behavior are unchanged. No
backfill is added, so the lead-status migration remains the only owner of its
initial-history backfill and cannot create duplicate rows in production.

## Create a brand-new environment

Use a new, empty, Supabase-compatible environment only. Never point this
procedure at production unless the exact SQL has been separately reviewed and
approved.

1. Create the Supabase project/environment so the provider-owned `auth` and
   `storage` schemas exist.
2. Configure a protected database connection outside Git. Do not paste its
   password into a command log or commit it.
3. Apply `supabase/bootstrap/00000000000000_core_schema.sql` with `psql` using
   `ON_ERROR_STOP=1` and the protected connection.
4. Apply the ordered migrations with `supabase db push` (or `supabase migration
   up --local` for a prepared local stack).
5. Compare tracked and applied migration versions and run the verification
   queries below.
6. Run the application test, type-check, build, and smoke-test procedures.

This is deterministic and does not require creating `leads` or a bucket in the
Supabase Dashboard. A plain `supabase db reset` is not the repository-specific
fresh procedure because it cannot inject the prerequisite before migration 2.
Local CLI/Docker execution was unavailable during this change, so a maintainer
must verify this sequence in an isolated environment:
**MANUAL LOCAL ENVIRONMENT CHECK REQUIRED**.

## Existing and partially configured environments

- Existing complete environment: `CREATE TABLE IF NOT EXISTS` preserves lead
  rows and identifiers. Required column types and NULL safety are checked. The
  migration reconciles defaults, RLS, explicit grants, and bucket metadata.
- Brand-new environment: the bootstrap creates the exact lead prerequisite;
  historical migrations then add history, handoff, analytics, comparison,
  referral, and upload-session objects; the final migration reconciles the
  complete result.
- Partially configured environment: nullable lead contact/path columns may be
  added without inventing data. A missing/wrong required column, required NULL,
  or incompatible primary key causes the atomic migration to fail with an
  actionable error. It does not guess, cast, backfill, drop, or rebuild data.

The lead allowlist, status allowlist, and JSON-object checks are added `NOT
VALID` when absent from an existing table. They protect new writes without
scanning/validating all historical rows during this migration. Validate them
only in a separately reviewed production step after the aggregate checks below
return zero. No database path constraint is added: new finalized paths are
strictly validated by the lead/upload server flow, while uninspected historical
paths remain update-compatible. `_pending` paths are never accepted by that
flow.

## Application-owned table privilege matrix

Every table has RLS enabled. `anon` and `authenticated` have no table
privileges and no policies. `PUBLIC` is revoked. `service_role` privileges are
listed explicitly; no application table grants DELETE.

| Table | RLS | anon | authenticated | service_role | DELETE | Expected architecture |
| --- | --- | --- | --- | --- | --- | --- |
| `leads` | Yes | None | None | SELECT, INSERT, UPDATE | No | Server lead creation and Admin review |
| `partners` | Yes | None | None | SELECT, INSERT, UPDATE | No | Admin-managed inactive lifecycle |
| `partner_capabilities` | Yes | None | None | SELECT, INSERT, UPDATE | No | Admin-managed routing capabilities |
| `lead_status_history` | Yes | None | None | SELECT, INSERT | No | Trigger/RPC-owned append-only history |
| `lead_partner_handoffs` | Yes | None | None | SELECT, INSERT, UPDATE | No | Trusted handoff RPCs/Admin |
| `lead_partner_handoff_history` | Yes | None | None | SELECT, INSERT | No | Append-only handoff history |
| `affiliate_conversions` | Yes | None | None | SELECT, INSERT, UPDATE | No | Trusted conversion RPCs/Admin |
| `affiliate_conversion_history` | Yes | None | None | SELECT, INSERT | No | Append-only conversion history |
| `admin_users` | Yes | None | None | SELECT | No | Server authorization lookup |
| `blog_posts` | Yes | None | None | SELECT, INSERT, UPDATE | No | Server CMS with archive lifecycle |
| `blog_post_revisions` | Yes | None | None | SELECT, INSERT | No | Trigger-owned revision history |
| `analytics_sessions` | Yes | None | None | SELECT, INSERT, UPDATE | No | First-party server analytics |
| `analytics_events` | Yes | None | None | SELECT, INSERT | No | Append-only server analytics |
| `lead_attributions` | Yes | None | None | SELECT, INSERT | No | Immutable lead attribution snapshots |
| `policy_comparisons` | Yes | None | None | SELECT, INSERT, UPDATE | No | Admin factual comparison workflow |
| `policy_comparison_options` | Yes | None | None | SELECT, INSERT, UPDATE | No | Admin comparison options |
| `policy_comparison_shares` | Yes | None | None | SELECT, INSERT, UPDATE | No | Protected share lifecycle |
| `partner_referral_destinations` | Yes | None | None | SELECT, INSERT, UPDATE | No | Admin-managed destinations |
| `partner_referral_links` | Yes | None | None | SELECT, INSERT, UPDATE | No | Server-created/revoked links |
| `partner_referral_clicks` | Yes | None | None | SELECT, INSERT, UPDATE | No | Server click lifecycle |
| `policy_upload_sessions` | Yes | None | None | SELECT, INSERT, UPDATE | No | Server direct-upload state machine |

The migration audit found 60 application functions: all declare `SECURITY
INVOKER` and `SET search_path = ''`; none uses `SECURITY DEFINER`. Trusted RPCs
are executable only by `service_role`. Trigger-only/internal helpers have
direct execution revoked from all application roles, including `service_role`.
The reconciliation migration does not modify Supabase-owned `auth.users` or
broad privileges on `storage.objects`/`storage.buckets`.

## Read-only verification

Run these in an approved administrative session. They return schema/configuration
metadata only; do not select lead rows, policy paths, auth users, or Storage
objects.

### Migration parity

```sql
select version, name
from supabase_migrations.schema_migrations
order by version;
```

Compare the versions to the filenames in `supabase/migrations/`. The bootstrap
is deliberately not recorded as a production migration; verify its lead table
contract with the queries below. Confirm the latest applied version through the
Supabase CLI migration list as a second check. **MANUAL / EXTERNAL CHECK**.

### RLS

```sql
select n.nspname as schema_name,
       c.relname as table_name,
       c.relrowsecurity as rowsecurity,
       c.relforcerowsecurity as force_rowsecurity
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
order by c.relname;
```

Every application-owned table in the matrix must report `rowsecurity = true`.
Forced RLS is not required because server operations use Supabase's trusted
`service_role` architecture.

### Effective table grants

```sql
select grantee, table_schema, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated', 'service_role')
order by table_name, grantee, privilege_type;
```

The result must match the matrix. Additionally verify no privilege is inherited
through `PUBLIC`:

```sql
select c.relname as table_name,
       has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE')
         as anon_has_any,
       has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE')
         as authenticated_has_any,
       has_table_privilege('service_role', c.oid, 'DELETE')
         as service_role_can_delete
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
order by c.relname;
```

All three boolean columns must be false for the application-owned tables.

### Functions and policies

```sql
select n.nspname as schema_name,
       p.proname as function_name,
       p.prosecdef as security_definer,
       p.proconfig
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname, pg_get_function_identity_arguments(p.oid);

select schemaname, tablename, policyname, roles, cmd
from pg_catalog.pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;
```

Application functions must show `security_definer = false` and a search path
configuration containing `search_path=""`. There must be no browser policy for
`public.leads` or for `storage.objects` in bucket `policy-documents`.

### Lead contract and deferred validation

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'leads'
order by ordinal_position;

select count(*) filter (
         where insurance_type not in ('travel', 'motor', 'property')
       ) as invalid_insurance_type_count,
       count(*) filter (
         where status not in (
           'new', 'reviewing', 'sent_to_partner', 'completed', 'rejected'
         )
       ) as invalid_status_count,
       count(*) filter (
         where details is null or jsonb_typeof(details) <> 'object'
       ) as invalid_details_count
from public.leads;
```

The aggregate query exposes no customer values. Constraint validation remains a
separate reviewed action; this runbook intentionally provides no automatic
production mutation.

### Private bucket metadata

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'policy-documents';
```

Expected: `public = false`, `file_size_limit = 10485760`, and exactly
`application/pdf`, `image/jpeg`, `image/png`. Do not inspect object names or
contents as part of this check.

## Backup and recovery boundaries

Verify each protection independently:

- Postgres backup: application tables, constraints, functions, and migration
  metadata. Confirm provider backup/PITR availability, schedule, retention, and
  restoration procedure. **MANUAL / EXTERNAL CHECK**.
- Storage backup: the bytes in private buckets. A Postgres backup of Storage
  metadata does not by itself preserve object bytes. Confirm an approved object
  backup/export and restore process. **MANUAL / EXTERNAL CHECK**.
- Migration history: Git plus `supabase_migrations.schema_migrations`; neither
  substitutes for a data backup.
- Environment variables and secrets: store in an approved secret manager and
  maintain a recovery inventory. Never commit their values.
- Git repository: preserve the bootstrap, migrations, runbook, and application
  code through the normal remote-repository controls.

Safe high-level recovery order:

1. Create the Supabase project/environment.
2. Configure required secrets externally.
3. Apply the fresh bootstrap, then the ordered migrations.
4. Verify migration parity, schema, RLS, function posture, and grants.
5. Verify the private `policy-documents` bucket configuration.
6. Restore/import Postgres data only through an approved process.
7. Restore private Storage objects through the separately approved process.
8. Re-run aggregate integrity and relationship checks.
9. Deploy the application.
10. Run lead, Admin signed-download, and secure direct-upload smoke tests.

Restore validation must also confirm row counts/relationships without printing
PII, status-history integrity, comparison/referral foreign keys, upload-session
state consistency, private bucket metadata, availability of required Storage
objects, and successful short-lived Admin signed downloads. All real backup and
restore exercises are **MANUAL / EXTERNAL CHECK**.

## Production boundary

This repository change does not connect to or mutate production. Review the
new bootstrap, migration, and verification evidence before any rollout.

**PRODUCTION APPLICATION REQUIRED SEPARATELY.**
