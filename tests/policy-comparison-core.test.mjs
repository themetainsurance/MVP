import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const build = mkdtempSync(join(tmpdir(), "tmi-comparison-core-"));
const compiler = join(root, "node_modules", "typescript", "bin", "tsc");
execFileSync(process.execPath, [
  compiler, "--target", "ES2022", "--module", "commonjs", "--moduleResolution", "node",
  "--skipLibCheck", "--esModuleInterop", "--outDir", build,
  ...["partner-types.ts", "comparison-types.ts", "comparison-definitions.ts", "comparison-engine.ts", "comparison-validation.ts", "comparison-token-core.ts", "comparison-share-snapshot.ts"].map((file) => join(root, "app", "lib", file)),
], { stdio: "pipe" });
const require = createRequire(import.meta.url);
const engine = require(join(build, "comparison-engine.js"));
const validation = require(join(build, "comparison-validation.js"));
const tokens = require(join(build, "comparison-token-core.js"));
const snapshots = require(join(build, "comparison-share-snapshot.js"));
after(() => rmSync(build, { recursive: true, force: true }));

const coverage = (status, extra = {}) => ({ kind: "coverage", status, ...extra });
const money = (amount, currency = "EUR") => ({ kind: "money", state: "stated", amount, currency });

test("coverage results are factual and preserve unknown information", () => {
  assert.equal(engine.compareFacts(coverage("included"), coverage("included")), "same");
  assert.equal(engine.compareFacts(coverage("not_included"), coverage("included")), "added");
  assert.equal(engine.compareFacts(coverage("included"), coverage("not_included")), "removed");
  assert.equal(engine.compareFacts(coverage("optional"), coverage("included")), "different");
  assert.equal(engine.compareFacts(coverage("not_stated"), coverage("included")), "not_stated");
  assert.equal(engine.compareFacts(coverage("not_applicable"), coverage("not_applicable")), "not_applicable");
});

test("money comparisons use exact strings and never compare currencies", () => {
  assert.equal(engine.compareFacts(money("180"), money("180.00")), "same");
  assert.equal(engine.compareFacts(money("180"), money("160")), "lower");
  assert.equal(engine.compareFacts(money("180"), money("200")), "higher");
  assert.equal(engine.compareFacts(money("180", "EUR"), money("170", "USD")), "not_comparable");
  assert.equal(engine.compareFacts(money("100000"), money("120000")), "higher");
  assert.equal(engine.compareFacts(money("100000"), money("80000")), "lower");
});

test("money and currency validation rejects unsafe formats", () => {
  for (const value of ["0", "50", "50.00", "1250.75", "100000"]) assert.equal(validation.isValidComparisonMoney(value), true, value);
  for (const value of ["-1", "1e3", "NaN", "Infinity", "1.001", "01"]) assert.equal(validation.isValidComparisonMoney(value), false, value);
  for (const value of ["EUR", "USD", "GBP", "MKD"]) assert.equal(validation.isValidComparisonCurrency(value), true, value);
  for (const value of ["eur", "EU", "EURO", "€€€"]) assert.equal(validation.isValidComparisonCurrency(value), false, value);
});

test("text comparison only normalizes whitespace and case", () => {
  const text = (value) => ({ kind: "text", state: "stated", value });
  assert.equal(engine.compareFacts(text("Europe"), text(" europe ")), "same");
  assert.equal(engine.compareFacts(text("Europe"), text("Worldwide excluding USA")), "different");
});

function comparison(overrides = {}) {
  return { id: "00000000-0000-4000-8000-000000000001", created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z", created_by: "private-admin", updated_by: "private-admin", lead_id: "private-lead", insurance_type: "property", status: "ready", title: "Property comparison", customer_intro: "Factual summary", internal_note: "secret", version: 4, ready_at: "2026-01-01T00:00:00.000Z", archived_at: null, ...overrides };
}
function option(type, provider, facts, overrides = {}) {
  return { id: crypto.randomUUID(), created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z", comparison_id: "private-comparison", option_type: type, status: "active", sort_order: 0, partner_id: type === "partner_offer" ? "private-partner" : null, handoff_id: type === "partner_offer" ? "private-handoff" : null, provider_name: provider, product_name: null, internal_reference: "secret-reference", effective_from: null, effective_to: null, facts, customer_note: null, internal_note: "secret-option-note", version: 1, full_name: "Private Person", email: "private@example.com", phone: "123", contact: "private contact", policy_document_path: "private/path", consent: true, details: { secret: true }, analytics_session_id: "private-session", ...overrides };
}

test("snapshot is immutable-by-value and excludes identifiers, PII and internal fields", () => {
  const currentFacts = { premium: money("180"), building_cover: coverage("included") };
  const offerFacts = { premium: money("170"), building_cover: coverage("included") };
  const current = option("current_policy", "Current provider", currentFacts);
  const offer = option("partner_offer", "Partner provider", offerFacts, { sort_order: 1 });
  const snapshot = snapshots.buildCustomerComparisonSnapshot(comparison(), [current, offer], "2026-01-02T00:00:00.000Z");
  const serialized = JSON.stringify(snapshot);
  for (const forbidden of ["lead_id", "full_name", "email", "phone", "contact", "policy_document_path", "consent", "details", "analytics_session_id", "internal_note", "internal_reference", "partner_id", "handoff_id", "private-admin", "private-lead", "private-partner", "private-handoff", "secret-reference"]) assert.equal(serialized.includes(forbidden), false, forbidden);
  offerFacts.premium.amount = "999";
  assert.equal(snapshot.offers[0].facts.premium.amount, "170");
});

test("snapshot requires one current policy and one to five active offers", () => {
  const fact = { premium: money("100") };
  const current = option("current_policy", "Current", fact);
  assert.throws(() => snapshots.buildCustomerComparisonSnapshot(comparison(), [current], new Date().toISOString()));
  const six = Array.from({ length: 6 }, (_, index) => option("partner_offer", `P${index}`, fact, { sort_order: index + 1 }));
  assert.throws(() => snapshots.buildCustomerComparisonSnapshot(comparison(), [current, ...six], new Date().toISOString()));
});

test("share tokens have 256 bits, strict base64url form and only hashes are stable", () => {
  const raw = tokens.generateComparisonShareToken();
  assert.match(raw, /^[A-Za-z0-9_-]{43}$/);
  const hash = tokens.hashComparisonShareToken(raw);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(tokens.hashComparisonShareToken(raw), hash);
  assert.notEqual(tokens.generateComparisonShareToken(), raw);
  assert.throws(() => tokens.hashComparisonShareToken("bad"));
});

test("migration enforces relationships, lifecycle, RLS and immutable shares", () => {
  const name = readdirSync(join(root, "supabase", "migrations")).find((file) => file.endsWith("_create_policy_comparisons.sql"));
  assert.ok(name);
  const sql = readFileSync(join(root, "supabase", "migrations", name), "utf8");
  assert.match(sql, /^begin;[\s\S]*commit;\s*$/i);
  for (const table of ["policy_comparisons", "policy_comparison_options", "policy_comparison_shares"]) {
    assert.match(sql, new RegExp(`create table public\\.${table}`, "i"));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(sql, new RegExp(`revoke all privileges on table public\\.${table}[\\s\\S]*?PUBLIC, anon, authenticated, service_role`, "i"));
  }
  assert.match(sql, /partner has no active matching capability/i);
  assert.match(sql, /handoff does not match the comparison lead and partner/i);
  assert.match(sql, /at most five active partner offers/i);
  assert.match(sql, /policy_comparison_options_one_active_current_idx/i);
  assert.match(sql, /comparison share snapshots are immutable/i);
  assert.match(sql, /p_source_version <> v_comparison\.version/i);
  assert.match(sql, /cannot be hard-deleted/i);
  assert.doesNotMatch(sql, /grant[^;]*delete/i);
  assert.doesNotMatch(sql, /create policy/i);
});

test("public share route is private, generic, no-store and never joins live lead data", () => {
  const page = readFileSync(join(root, "app", "compare", "[token]", "page.tsx"), "utf8");
  const lookup = readFileSync(join(root, "app", "lib", "comparison-public-data.ts"), "utf8");
  assert.match(page, /noindex, nofollow, noarchive/);
  assert.match(page, /referrer: "no-referrer"/);
  assert.match(page, /force-dynamic/);
  assert.match(page, /noStore\(\)/);
  assert.match(lookup, /snapshot, expires_at, revoked_at/);
  assert.doesNotMatch(lookup, /\.from\("leads"\)|\.from\("partners"\)|policy_document/);
});

test("comparison paths are completely excluded from first-party analytics", () => {
  const analytics = readFileSync(join(root, "app", "lib", "analytics-validation.ts"), "utf8");
  assert.match(analytics, /admin\|api\|compare/);
  assert.equal(validation.isValidComparisonShareToken("x".repeat(43)), true);
});

test("admin routes are protected and mutation routes use same-origin authorization", () => {
  const list = readFileSync(join(root, "app", "admin", "(protected)", "comparisons", "page.tsx"), "utf8");
  const apiRoot = join(root, "app", "api", "admin", "comparisons");
  assert.match(list, /await requireAdmin\(\)/);
  const routeSources = [];
  function collect(path) { for (const entry of readdirSync(path, { withFileTypes: true })) entry.isDirectory() ? collect(join(path, entry.name)) : entry.name === "route.ts" && routeSources.push(readFileSync(join(path, entry.name), "utf8")); }
  collect(apiRoot);
  assert.equal(routeSources.length, 8);
  for (const source of routeSources) assert.match(source, /authorizeAdminOperation\(request\)/);
});

test("comparison engine contains no scoring, ranking or external/AI calls", () => {
  const source = ["comparison-engine.ts", "comparison-definitions.ts"].map((file) => readFileSync(join(root, "app", "lib", file), "utf8")).join("\n");
  assert.doesNotMatch(source, /\b(score|rating|rank|winner|best value|openai|fetch\()\b/i);
});

test("customer comparison layout switches from tables to cards on narrow screens", () => {
  const css = readFileSync(join(root, "app", "components", "PolicyComparisonView.module.css"), "utf8");
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /\.desktopTable \{ display: none; \}/);
  assert.match(css, /\.mobileRows \{ display: grid;/);
});
