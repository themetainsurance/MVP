import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDirectory = join(root, "supabase", "migrations");
const migrationNames = readdirSync(migrationsDirectory)
  .filter((name) => name.endsWith(".sql"))
  .sort();
const migrationSql = migrationNames
  .map((name) => readFileSync(join(migrationsDirectory, name), "utf8"))
  .join("\n");
const bootstrap = readFileSync(
  join(root, "supabase", "bootstrap", "00000000000000_core_schema.sql"),
  "utf8"
);
const reconciliationName =
  "20260825152544_reconcile_core_database_baseline.sql";
const reconciliation = readFileSync(
  join(migrationsDirectory, reconciliationName),
  "utf8"
);
const runbook = readFileSync(
  join(root, "docs", "database-recovery-and-baseline.md"),
  "utf8"
);
const leadValidation = readFileSync(
  join(root, "app", "api", "leads", "validation.ts"),
  "utf8"
);

const applicationTables = [
  "leads",
  "partners",
  "partner_capabilities",
  "lead_status_history",
  "lead_partner_handoffs",
  "lead_partner_handoff_history",
  "affiliate_conversions",
  "affiliate_conversion_history",
  "admin_users",
  "blog_posts",
  "blog_post_revisions",
  "analytics_sessions",
  "analytics_events",
  "lead_attributions",
  "policy_comparisons",
  "policy_comparison_options",
  "policy_comparison_shares",
  "partner_referral_destinations",
  "partner_referral_links",
  "partner_referral_clicks",
  "policy_upload_sessions",
];

const tablePrivileges = new Map([
  ["leads", "select, insert, update"],
  ["partners", "select, insert, update"],
  ["partner_capabilities", "select, insert, update"],
  ["lead_status_history", "select, insert"],
  ["lead_partner_handoffs", "select, insert, update"],
  ["lead_partner_handoff_history", "select, insert"],
  ["affiliate_conversions", "select, insert, update"],
  ["affiliate_conversion_history", "select, insert"],
  ["admin_users", "select"],
  ["blog_posts", "select, insert, update"],
  ["blog_post_revisions", "select, insert"],
  ["analytics_sessions", "select, insert, update"],
  ["analytics_events", "select, insert"],
  ["lead_attributions", "select, insert"],
  ["policy_comparisons", "select, insert, update"],
  ["policy_comparison_options", "select, insert, update"],
  ["policy_comparison_shares", "select, insert, update"],
  ["partner_referral_destinations", "select, insert, update"],
  ["partner_referral_links", "select, insert, update"],
  ["partner_referral_clicks", "select, insert, update"],
  ["policy_upload_sessions", "select, insert, update"],
]);

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tablePattern(prefix, table, suffix = "") {
  return new RegExp(
    `${prefix}\\s+public\\.${escaped(table)}${suffix}`,
    "is"
  );
}

test("keeps the immutable migrations and supplies the missing pre-migration lead prerequisite", () => {
  assert.equal(migrationNames.at(-1), reconciliationName);
  assert.match(bootstrap, /create table if not exists public\.leads/i);
  assert.doesNotMatch(
    readFileSync(join(migrationsDirectory, migrationNames[0]), "utf8"),
    /create table(?: if not exists)? public\.leads/i
  );
  assert.match(
    readFileSync(join(migrationsDirectory, migrationNames[1]), "utf8"),
    /(?:on|from|table) public\.leads/i
  );
});

test("defines the exact minimum lead column contract and defaults", () => {
  const requiredDefinitions = [
    /id uuid primary key default gen_random_uuid\(\)/i,
    /created_at timestamptz not null default now\(\)/i,
    /insurance_type text not null/i,
    /full_name text/i,
    /email text/i,
    /phone text/i,
    /preferred_contact text/i,
    /status text not null default 'new'/i,
    /source text not null default 'website'/i,
    /policy_document_path text/i,
    /consent boolean not null/i,
    /details jsonb not null default '\{\}'::jsonb/i,
  ];
  for (const pattern of requiredDefinitions) {
    assert.match(bootstrap, pattern);
    assert.match(reconciliation, pattern);
  }
});

test("limits lead insurance types, statuses, and details shape", () => {
  for (const sql of [bootstrap, reconciliation]) {
    assert.match(
      sql,
      /insurance_type in \('travel', 'motor', 'property'\)/i
    );
    for (const status of [
      "new",
      "reviewing",
      "sent_to_partner",
      "completed",
      "rejected",
    ]) {
      assert.match(sql, new RegExp(`'${status}'`, "i"));
    }
    assert.match(sql, /jsonb_typeof\(details\) = 'object'/i);
  }
  assert.match(reconciliation, /not valid/i);
});

test("enables lead RLS and makes browser revokes and server grants explicit", () => {
  for (const sql of [bootstrap, reconciliation]) {
    assert.match(sql, /alter table public\.leads enable row level security/i);
    assert.match(
      sql,
      /revoke all privileges on table public\.leads\s+from PUBLIC, anon, authenticated, service_role/is
    );
    assert.match(
      sql,
      /grant select, insert, update on table public\.leads to service_role/i
    );
  }
});

test("hardens partners and capabilities for server-only non-delete administration", () => {
  for (const table of ["partners", "partner_capabilities"]) {
    assert.match(
      reconciliation,
      tablePattern(
        "revoke all privileges on table",
        table,
        "\\s+from PUBLIC, anon, authenticated, service_role"
      )
    );
    assert.match(
      reconciliation,
      tablePattern(
        "grant select, insert, update on table",
        table,
        "\\s+to service_role"
      )
    );
  }
  assert.match(
    reconciliation,
    /revoke execute on function public\.set_partner_model_updated_at\(\)\s+from PUBLIC, anon, authenticated, service_role/is
  );
});

test("reconciles the policy-documents bucket to the exact private limits", () => {
  assert.match(reconciliation, /insert into storage\.buckets/i);
  assert.match(reconciliation, /'policy-documents',\s*'policy-documents'/is);
  assert.match(
    reconciliation,
    /'policy-documents',\s*'policy-documents',\s*false,\s*10485760/is
  );
  assert.match(
    reconciliation,
    /array\['application\/pdf', 'image\/jpeg', 'image\/png'\]::text\[\]/i
  );
  assert.match(reconciliation, /on conflict \(id\) do update/i);
  assert.doesNotMatch(reconciliation, /image\/svg|image\/webp/i);
});

test("introduces no public policy-documents Storage policy", () => {
  assert.doesNotMatch(
    migrationSql,
    /create policy[\s\S]{0,500}policy-documents/i
  );
  assert.doesNotMatch(
    reconciliation,
    /(?:insert|select|update|delete|all)[\s\S]{0,100}storage\.objects[\s\S]{0,100}to\s+(?:anon|authenticated)/i
  );
});

test("keeps the reconciliation atomic and free of destructive or seeded application data", () => {
  assert.match(reconciliation, /^begin;/i);
  assert.match(reconciliation, /commit;\s*$/i);
  assert.doesNotMatch(
    reconciliation,
    /\b(?:drop\s+(?:table|column)|truncate|delete\s+from)\b/i
  );
  assert.doesNotMatch(reconciliation, /insert into public\./i);
  assert.doesNotMatch(reconciliation, /update public\./i);
});

test("has RLS and explicit minimal service-role grants for every application table", () => {
  const completeSql = `${bootstrap}\n${migrationSql}`;
  for (const table of applicationTables) {
    assert.match(
      completeSql,
      tablePattern("alter table", table, "\\s+enable row level security"),
      `${table} must enable RLS`
    );
    assert.match(
      completeSql,
      tablePattern(
        `grant ${tablePrivileges.get(table)} on table`,
        table,
        "\\s+to service_role"
      ),
      `${table} must grant only its documented server privileges`
    );
  }
  assert.doesNotMatch(
    completeSql,
    /grant\s+[^;]*\bdelete\b[^;]*\bon table public\./i
  );
});

test("keeps every application function invoker-scoped with an empty search path", () => {
  const definitions = migrationSql.match(
    /create(?: or replace)? function public\./gi
  ) ?? [];
  const invokers = migrationSql.match(/security invoker/gi) ?? [];
  const emptySearchPaths = migrationSql.match(/set search_path = ''/gi) ?? [];
  assert.equal(definitions.length, 60);
  assert.equal(invokers.length, definitions.length);
  assert.equal(emptySearchPaths.length, definitions.length);
  assert.doesNotMatch(migrationSql, /security definer/i);
});

test("retains strict finalized lead paths and rejects temporary upload paths", () => {
  assert.ok(
    leadValidation.includes(
      "/^(?:motor|property)\\/[0-9a-f]{32}\\.(?:pdf|jpg|png)$/;"
    )
  );
  const finalizedPath = /^(?:motor|property)\/[0-9a-f]{32}\.(?:pdf|jpg|png)$/;
  assert.equal(finalizedPath.test("_pending/motor/example.pdf"), false);
  assert.equal(finalizedPath.test(`motor/${"a".repeat(32)}.pdf`), true);
  assert.match(leadValidation, /insuranceType === "travel"/);
});

test("documents parity, RLS, grant, bucket, backup, and recovery verification", () => {
  for (const phrase of [
    "supabase_migrations.schema_migrations",
    "information_schema.role_table_grants",
    "relrowsecurity",
    "storage.buckets",
    "Postgres backup",
    "Storage backup",
    "MANUAL LOCAL ENVIRONMENT CHECK REQUIRED",
    "PRODUCTION APPLICATION REQUIRED SEPARATELY",
  ]) {
    assert.ok(runbook.includes(phrase), `runbook must include ${phrase}`);
  }
});

test("documents all application-owned tables in the grant matrix", () => {
  for (const table of applicationTables) {
    assert.match(runbook, new RegExp("\\| `" + escaped(table) + "` \\|"));
  }
});

test("contains no embedded production credentials or secret values", () => {
  const changedText = `${bootstrap}\n${reconciliation}\n${runbook}`;
  assert.doesNotMatch(
    changedText,
    /(?:service_role_key|supabase_service_role_key|cron_secret|database_password|admin_password)\s*[:=]\s*[^\s<]+/i
  );
  assert.doesNotMatch(changedText, /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(changedText, /postgres(?:ql)?:\/\/[^\s<]+:[^\s<]+@/i);
});
