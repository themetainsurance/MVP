import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const analyticsBuild = mkdtempSync(join(tmpdir(), "tmi-analytics-core-"));
const leadBuild = mkdtempSync(join(tmpdir(), "tmi-analytics-leads-"));
const compiler = join(repositoryRoot, "node_modules", "typescript", "bin", "tsc");

execFileSync(process.execPath, [
  compiler,
  "--target", "ES2022",
  "--module", "commonjs",
  "--moduleResolution", "node",
  "--skipLibCheck",
  "--esModuleInterop",
  "--outDir", analyticsBuild,
  join(repositoryRoot, "app", "lib", "partner-types.ts"),
  join(repositoryRoot, "app", "lib", "analytics-types.ts"),
  join(repositoryRoot, "app", "lib", "analytics-validation.ts"),
], { stdio: "pipe" });

execFileSync(process.execPath, [
  compiler,
  "--target", "ES2022",
  "--module", "commonjs",
  "--moduleResolution", "node",
  "--skipLibCheck",
  "--esModuleInterop",
  "--outDir", leadBuild,
  join(repositoryRoot, "app", "api", "leads", "validation.ts"),
], { stdio: "pipe" });

const require = createRequire(import.meta.url);
const types = require(join(analyticsBuild, "analytics-types.js"));
const validation = require(join(analyticsBuild, "analytics-validation.js"));
const leadValidation = require(join(leadBuild, "validation.js"));

after(() => {
  rmSync(analyticsBuild, { recursive: true, force: true });
  rmSync(leadBuild, { recursive: true, force: true });
});

const sessionId = "00000000-0000-4000-8000-000000000001";
const eventId = "00000000-0000-4000-8000-000000000002";

function validEvent(overrides = {}) {
  return {
    session_id: sessionId,
    event_id: eventId,
    event_type: "page_view",
    page_path: "/travel",
    insurance_type: "travel",
    form_mode: null,
    attribution: {
      landing_path: "/",
      referrer_host: "google.com",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "travel-insurance",
      utm_term: null,
      utm_content: null,
    },
    ...overrides,
  };
}

function validLead(overrides = {}) {
  return {
    insurance_type: "travel",
    full_name: "Test Person",
    email: "person@example.com",
    phone: "",
    preferred_contact: "Email",
    consent: true,
    details: { destination: "Italy" },
    ...overrides,
  };
}

test("accepts the two exact public analytics event shapes", () => {
  assert.equal(validation.validateAnalyticsEvent(validEvent()).success, true);
  assert.equal(validation.validateAnalyticsEvent(validEvent({
    event_type: "form_started",
    form_mode: "manual",
  })).success, true);
  assert.equal(validation.validateAnalyticsEvent(validEvent({
    event_type: "form_started",
    insurance_type: null,
    form_mode: "ai_assistant",
  })).success, true);
});

test("rejects invalid UUIDs, event names, insurance types and form modes", () => {
  assert.equal(validation.validateAnalyticsEvent(validEvent({ session_id: "not-a-uuid" })).success, false);
  assert.equal(validation.validateAnalyticsEvent(validEvent({ event_type: "lead_created" })).success, false);
  assert.equal(validation.validateAnalyticsEvent(validEvent({ insurance_type: "health" })).success, false);
  assert.equal(validation.validateAnalyticsEvent(validEvent({ event_type: "form_started", form_mode: "chat" })).success, false);
  assert.equal(validation.validateAnalyticsEvent(validEvent({ form_mode: "manual" })).success, false);
});

test("rejects query strings, fragments, admin/API/comparison paths and oversized UTM values", () => {
  for (const path of ["/travel?email=x", "/travel#form", "/admin", "/admin/leads", "/api/leads", "/compare", "/compare/private-token"]) {
    assert.equal(validation.validateAnalyticsEvent(validEvent({ page_path: path })).success, false, path);
  }
  assert.equal(validation.validateAnalyticsEvent(validEvent({
    attribution: { ...validEvent().attribution, landing_path: "/admin" },
  })).success, false);
  assert.equal(validation.validateAnalyticsEvent(validEvent({
    attribution: { ...validEvent().attribution, landing_path: "/compare/private-token" },
  })).success, false);
  assert.equal(validation.validateAnalyticsEvent(validEvent({
    attribution: { ...validEvent().attribution, utm_campaign: "x".repeat(151) },
  })).success, false);
});

test("normalizes internal referrers to null and rejects raw referrer URLs", () => {
  const internal = validation.validateAnalyticsEvent(validEvent({
    attribution: { ...validEvent().attribution, referrer_host: "WWW.THEMETAINSURANCE.COM" },
  }));
  assert.equal(internal.success, true);
  assert.equal(internal.data.attribution.referrer_host, null);
  assert.equal(validation.validateAnalyticsEvent(validEvent({
    attribution: { ...validEvent().attribution, referrer_host: "https://google.com/search?q=insurance" },
  })).success, false);
});

test("rejects malformed JSON and bodies over the 8 KB analytics limit", () => {
  assert.throws(() => JSON.parse("{"));
  assert.equal(validation.isAnalyticsRequestBodyTooLarge("x".repeat(8 * 1024)), false);
  assert.equal(validation.isAnalyticsRequestBodyTooLarge("x".repeat(8 * 1024 + 1)), true);
});

test("maps only the approved non-PII fields to the ingestion RPC", () => {
  const checked = validation.validateAnalyticsEvent(validEvent());
  assert.equal(checked.success, true);
  const args = types.toAnalyticsRpcArguments(checked.data);
  assert.deepEqual(Object.keys(args).sort(), [
    "p_client_event_id", "p_event_type", "p_form_mode", "p_insurance_type",
    "p_landing_path", "p_page_path", "p_referrer_host", "p_session_id",
    "p_utm_campaign", "p_utm_content", "p_utm_medium", "p_utm_source", "p_utm_term",
  ].sort());
  for (const forbidden of ["name", "email", "phone", "message", "policy", "vehicle", "property", "travel_dates"]) {
    assert.equal(JSON.stringify(args).toLowerCase().includes(forbidden), false, forbidden);
  }
});

test("honors browser Do Not Track without changing form logic", () => {
  assert.equal(types.isDoNotTrackEnabled("1"), true);
  assert.equal(types.isDoNotTrackEnabled("0"), false);
  assert.equal(types.isDoNotTrackEnabled(null), false);
  const provider = readFileSync(join(repositoryRoot, "app", "components", "AnalyticsProvider.tsx"), "utf8");
  assert.match(provider, /navigator\.doNotTrack/);
  assert.match(provider, /if \([\s\S]*doNotTrackIsActive\(\)/);
  for (const page of ["travel", "motor", "property", "ai-assistant"]) {
    const source = readFileSync(join(repositoryRoot, "app", page, "page.tsx"), "utf8");
    assert.match(source, /fetch\(\s*"\/api\/leads"/);
  }
});

test("uses an in-memory UUID and adds no persistent analytics identifier", () => {
  const provider = readFileSync(join(repositoryRoot, "app", "components", "AnalyticsProvider.tsx"), "utf8");
  assert.match(provider, /crypto\.randomUUID\(\)/);
  assert.match(provider, /useRef<string \| null>\(null\)/);
  assert.doesNotMatch(provider, /localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(provider, /userAgent|fingerprint|advertising/i);
});

test("instruments page views and every real lead-generating flow", () => {
  const provider = readFileSync(join(repositoryRoot, "app", "components", "AnalyticsProvider.tsx"), "utf8");
  assert.match(provider, /eventType: "page_view"/);
  assert.match(provider, /lastPageViewRef\.current === pathname/);
  assert.doesNotMatch(provider, /searchParams.*page_view/);

  for (const page of ["travel", "motor", "property", "ai-assistant"]) {
    const source = readFileSync(join(repositoryRoot, "app", page, "page.tsx"), "utf8");
    assert.match(source, /trackFormStarted/);
    assert.match(source, /analytics_session_id/);
  }
  const motor = readFileSync(join(repositoryRoot, "app", "motor", "page.tsx"), "utf8");
  const property = readFileSync(join(repositoryRoot, "app", "property", "page.tsx"), "utf8");
  assert.match(motor, /formMode: mode/);
  assert.match(property, /formMode: mode/);
  const assistant = readFileSync(join(repositoryRoot, "app", "ai-assistant", "page.tsx"), "utf8");
  assert.match(assistant, /formMode: "ai_assistant"/);
});

test("keeps analytics optional in the lead contract", () => {
  const withoutAnalytics = leadValidation.validateLeadBody(validLead());
  assert.equal(withoutAnalytics.success, true);
  assert.equal(withoutAnalytics.data.analytics_session_id, null);
  const withAnalytics = leadValidation.validateLeadBody(validLead({ analytics_session_id: sessionId }));
  assert.equal(withAnalytics.success, true);
  assert.equal(withAnalytics.data.analytics_session_id, sessionId);
  assert.equal(leadValidation.validateLeadBody(validLead({ analytics_session_id: "bad" })).success, false);
});

test("snapshots attribution only after a successful lead and tolerates failure", () => {
  const route = readFileSync(join(repositoryRoot, "app", "api", "leads", "route.ts"), "utf8");
  const insertPosition = route.indexOf('.from("leads")');
  const attributionPosition = route.indexOf("await snapshotLeadAttribution");
  assert.ok(insertPosition >= 0);
  assert.ok(attributionPosition > insertPosition);
  assert.match(route, /try \{\s*await snapshotLeadAttribution[\s\S]*catch \{/);
  assert.match(route, /lead_attribution_store_failed/);
  assert.doesNotMatch(route, /sessionId.*console|analyticsSessionId.*console/);
});

test("migration preserves first touch and safely deduplicates events and form starts", () => {
  const migrationName = readdirSync(join(repositoryRoot, "supabase", "migrations"))
    .find((name) => name.endsWith("_create_first_party_analytics.sql"));
  assert.ok(migrationName);
  const sql = readFileSync(join(repositoryRoot, "supabase", "migrations", migrationName), "utf8");
  const upsert = sql.match(/on conflict \(id\) do update[\s\S]*?;/i)?.[0] ?? "";
  assert.match(upsert, /last_seen_at/);
  for (const field of ["landing_path", "referrer_host", "utm_source", "utm_medium", "utm_campaign"]) {
    assert.doesNotMatch(upsert, new RegExp(`${field}\\s*=`));
  }
  assert.match(sql, /unique \(client_event_id\)/i);
  assert.match(sql, /create unique index analytics_events_form_started_flow_key/i);
  assert.match(sql, /coalesce\(insurance_type, '__unknown__'\)/i);
  assert.match(sql, /where event_type = 'form_started'/i);
  assert.match(sql, /on conflict do nothing/i);
});

test("follow-up migration fixes analytics ingestion without changing its contract", () => {
  const migrations = readdirSync(join(repositoryRoot, "supabase", "migrations"));
  const originalName = migrations.find((name) =>
    name.endsWith("_create_first_party_analytics.sql")
  );
  const fixName = migrations.find((name) =>
    name.endsWith("_fix_analytics_event_ingestion.sql")
  );
  assert.ok(originalName);
  assert.ok(fixName);

  const originalSql = readFileSync(
    join(repositoryRoot, "supabase", "migrations", originalName),
    "utf8"
  );
  const fixSql = readFileSync(
    join(repositoryRoot, "supabase", "migrations", fixName),
    "utf8"
  );
  const originalSignature = originalSql.match(
    /create function public\.record_first_party_analytics_event\(([\s\S]*?)\)\s*returns boolean/i
  )?.[1];
  const fixSignature = fixSql.match(
    /create or replace function public\.record_first_party_analytics_event\(([\s\S]*?)\)\s*returns boolean/i
  )?.[1];
  assert.ok(originalSignature);
  assert.ok(fixSignature);
  assert.equal(fixSignature.replace(/\s+/g, " ").trim(), originalSignature.replace(/\s+/g, " ").trim());

  assert.match(fixSql, /^\s*begin;/i);
  assert.match(fixSql, /commit;\s*$/i);
  assert.equal((fixSql.match(/create or replace function/gi) ?? []).length, 1);
  assert.match(fixSql, /greatest\(sessions\.last_seen_at, now\(\)\)/i);
  assert.doesNotMatch(fixSql, /pg_catalog\.greatest/i);
  assert.match(fixSql, /returns boolean[\s\S]*language plpgsql[\s\S]*security invoker[\s\S]*set search_path = ''/i);

  const upsert = fixSql.match(/on conflict \(id\) do update[\s\S]*?;/i)?.[0] ?? "";
  assert.match(upsert, /^on conflict \(id\) do update\s+set last_seen_at = greatest/i);
  for (const field of [
    "landing_path", "referrer_host", "utm_source", "utm_medium",
    "utm_campaign", "utm_term", "utm_content", "first_seen_at",
  ]) {
    assert.doesNotMatch(upsert, new RegExp(`${field}\\s*=`));
  }

  assert.match(fixSql, /insert into public\.analytics_events \(\s*client_event_id,\s*session_id,\s*event_type,\s*page_path,\s*insurance_type,\s*form_mode\s*\)/i);
  assert.match(fixSql, /on conflict do nothing;\s*\n\s*get diagnostics v_inserted = row_count;\s*\n\s*return v_inserted = 1;/i);
  assert.match(originalSql, /create unique index analytics_events_form_started_flow_key[\s\S]*where event_type = 'form_started'/i);

  const migrationOnlySql = fixSql.replace(/as \$\$[\s\S]*?\$\$;/i, "");
  assert.doesNotMatch(migrationOnlySql, /\b(?:insert into|update|delete from|truncate)\b/i);
  assert.doesNotMatch(fixSql, /\b(?:create|alter|drop)\s+(?:table|index|policy)\b/i);
  assert.doesNotMatch(fixSql, /\b(?:grant|revoke)\b/i);
  assert.match(originalSql, /revoke execute on function public\.record_first_party_analytics_event\([\s\S]*?\) from PUBLIC, anon, authenticated, service_role;/i);
  assert.match(originalSql, /grant execute on function public\.record_first_party_analytics_event\([\s\S]*?\) to service_role;/i);
});

test("migration keeps operational tables authoritative and counts unique lead stages", () => {
  const migrationName = readdirSync(join(repositoryRoot, "supabase", "migrations"))
    .find((name) => name.endsWith("_create_first_party_analytics.sql"));
  const sql = readFileSync(join(repositoryRoot, "supabase", "migrations", migrationName), "utf8");
  assert.match(sql, /from public\.leads as leads/i);
  assert.match(sql, /from public\.lead_partner_handoffs as handoffs/i);
  assert.match(sql, /join public\.affiliate_conversions as conversions/i);
  assert.match(sql, /select count\(\*\)[\s\S]*from lead_cohort[\s\S]*where exists/i);
  assert.match(sql, /handoffs\.sent_at is not null/i);
  assert.match(sql, /conversions\.status = 'confirmed'/i);
  assert.match(sql, /conversions\.commission_status = 'paid'/i);
  assert.doesNotMatch(sql, /lead_created|handoff_sent|conversion_confirmed|commission_paid/);
});

test("paid commission SQL groups NUMERIC values by currency and never combines currencies", () => {
  const migrationName = readdirSync(join(repositoryRoot, "supabase", "migrations"))
    .find((name) => name.endsWith("_create_first_party_analytics.sql"));
  const sql = readFileSync(join(repositoryRoot, "supabase", "migrations", migrationName), "utf8");
  const functionSql = sql.match(/create function public\.get_admin_analytics_paid_commissions[\s\S]*?\n\$\$;/i)?.[0] ?? "";
  assert.match(functionSql, /sum\(conversions\.commission_amount\)::text/i);
  assert.match(functionSql, /group by conversions\.commission_currency/i);
  assert.match(functionSql, /commission_status = 'paid'/i);
  assert.equal(types.formatAnalyticsRate(1, 0), "N/A");
  assert.equal(types.formatAnalyticsRate(1, 4), "25.0%");
});

test("analytics tables are server-only with RLS, least privilege and no delete grant", () => {
  const migrationName = readdirSync(join(repositoryRoot, "supabase", "migrations"))
    .find((name) => name.endsWith("_create_first_party_analytics.sql"));
  const sql = readFileSync(join(repositoryRoot, "supabase", "migrations", migrationName), "utf8");
  for (const table of ["analytics_sessions", "analytics_events", "lead_attributions"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(sql, new RegExp(`revoke all privileges on table public\\.${table}[\\s\\S]*?PUBLIC, anon, authenticated, service_role`, "i"));
  }
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant[^;]*delete[^;]*analytics_/i);
  assert.match(sql, /security invoker/gi);
  assert.match(sql, /set search_path = ''/gi);
});

test("the public endpoint is same-origin, bounded and non-critical", () => {
  const route = readFileSync(join(repositoryRoot, "app", "api", "analytics", "event", "route.ts"), "utf8");
  assert.match(route, /origin === new URL\(request\.url\)\.origin/);
  assert.match(route, /ANALYTICS_REQUEST_BODY_BYTES/);
  assert.match(route, /status: 204/);
  assert.match(route, /analytics_event_invalid/);
  assert.match(route, /analytics_event_store_failed/);
  assert.doesNotMatch(route, /console\.(?:log|error|warn)\([^\n]*(?:session|utm|referrer|page_path)/i);
});

test("admin analytics is protected, aggregate-only and pre-migration safe", () => {
  const page = readFileSync(join(repositoryRoot, "app", "admin", "(protected)", "analytics", "page.tsx"), "utf8");
  const helper = readFileSync(join(repositoryRoot, "app", "lib", "analytics-admin-data.ts"), "utf8");
  assert.match(page, /await requireAdmin\(\)/);
  assert.match(page, /Analytics database setup is not available yet/);
  assert.match(helper, /import "server-only"/);
  assert.match(helper, /get_admin_analytics_summary/);
  assert.doesNotMatch(helper, /full_name|email|phone|details|policy_document_path/);
  assert.doesNotMatch(page, /dangerouslySetInnerHTML/);
});

test("privacy disclosure accurately distinguishes application analytics from infrastructure logs", () => {
  const privacy = readFileSync(join(repositoryRoot, "app", "privacy", "page.tsx"), "utf8");
  assert.match(privacy, /random ephemeral[\s\S]*session identifier/i);
  assert.match(privacy, /does not store IP[\s\S]*user-agent strings/i);
  assert.match(privacy, /infrastructure providers may separately process connection/i);
  assert.match(privacy, /not stored in an[\s\S]*analytics cookie or localStorage/i);
  assert.match(privacy, /Do Not Track/i);
});
