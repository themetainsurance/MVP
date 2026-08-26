import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const build = mkdtempSync(join(tmpdir(), "tmi-partner-referral-"));
const compiler = join(root, "node_modules", "typescript", "bin", "tsc");
execFileSync(process.execPath, [
  compiler, "--target", "ES2022", "--module", "commonjs", "--moduleResolution", "node",
  "--skipLibCheck", "--esModuleInterop", "--outDir", build,
  ...["partner-types.ts", "partner-referral-types.ts", "partner-referral-token-core.ts", "partner-referral-url.ts", "partner-referral-validation.ts", "analytics-types.ts", "analytics-validation.ts"].map((file) => join(root, "app", "lib", file)),
], { stdio: "pipe" });
const require = createRequire(import.meta.url);
const validation = require(join(build, "partner-referral-validation.js"));
const tokens = require(join(build, "partner-referral-token-core.js"));
const urls = require(join(build, "partner-referral-url.js"));
const analytics = require(join(build, "analytics-validation.js"));
after(() => rmSync(build, { recursive: true, force: true }));

const uuid = (ending) => `00000000-0000-4000-8000-${ending.padStart(12, "0")}`;
const validDestination = (overrides = {}) => ({
  insurance_type: "travel", country_code: "MK",
  destination_url: "https://partner.example.com/travel",
  customer_link_label: "Continue to partner", tracking_parameter_name: "subid",
  external_campaign_reference: "travel-campaign", internal_note: "Reviewed internally",
  ...overrides,
});
test("accepts safe absolute HTTPS destinations and preserves ordinary query parameters", () => {
  assert.equal(validation.validateReferralDestinationUrl("https://partner.example.com/travel"), "https://partner.example.com/travel");
  assert.equal(validation.validateReferralDestinationUrl("https://partner.example.com/quote?campaign=travel"), "https://partner.example.com/quote?campaign=travel");
  assert.equal(validation.validateReferralDestinationInput(validDestination()).success, true);
});

test("rejects unsafe schemes, credentials, fragments, templates and internal hosts", () => {
  for (const url of [
    "http://partner.example.com", "javascript:alert(1)", "data:text/plain,test", "file:///tmp/a", "ftp://example.com/a",
    "https://user:password@example.com", "https://localhost/a", "https://service.internal/a", "https://127.0.0.1/a",
    "https://10.1.2.3/a", "https://172.20.1.1/a", "https://192.168.1.2/a", "https://[::1]/a",
    "https://example.com/a#token", "https://example.com/{{customer}}", "https://example.com/${token}",
  ]) assert.equal(validation.validateReferralDestinationUrl(url), null, url);
});

test("rejects credential-like URL parameters and configuration text", () => {
  for (const key of ["api_key", "apikey", "secret", "password", "token", "access_token", "authorization", "client_secret"]) {
    assert.equal(validation.validateReferralDestinationUrl(`https://example.com/a?${key}=private`), null, key);
  }
  assert.equal(validation.validateReferralDestinationInput(validDestination({ internal_note: "api_key=private" })).success, false);
});

test("validates neutral labels, country codes and tracking parameter names", () => {
  assert.equal(validation.validateReferralDestinationInput(validDestination({ customer_link_label: "Best offer" })).success, false);
  assert.equal(validation.validateReferralDestinationInput(validDestination({ country_code: "M1" })).success, false);
  assert.equal(validation.validateReferralDestinationInput(validDestination({ tracking_parameter_name: "sub.id" })).success, false);
  assert.equal(validation.validateReferralDestinationInput(validDestination({ country_code: "gb", tracking_parameter_name: "click-id" })).data.country_code, "GB");
});

test("tokens contain 256 random bits in base64url form and only stable SHA-256 hashes", () => {
  const token = tokens.generateReferralToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.match(tokens.hashReferralToken(token), /^[0-9a-f]{64}$/);
  assert.equal(tokens.hashReferralToken(token), tokens.hashReferralToken(token));
  assert.notEqual(tokens.generateReferralToken(), token);
  assert.throws(() => tokens.hashReferralToken("bad"));
});

test("link input only permits expiring links of 1, 7, 14 or 30 days", () => {
  for (const expiry_days of [1, 7, 14, 30]) assert.equal(validation.validateReferralLinkInput({ destination_id: uuid("1"), expiry_days, lead_id: null, handoff_id: null, comparison_id: null, comparison_share_id: null }).success, true);
  for (const expiry_days of [0, 2, 31, 365]) assert.equal(validation.validateReferralLinkInput({ destination_id: uuid("1"), expiry_days, lead_id: null, handoff_id: null, comparison_id: null, comparison_share_id: null }).success, false);
});

test("tracking URL construction preserves existing parameters and appends only opaque reference", () => {
  const click = uuid("7");
  const output = urls.buildPartnerReferralUrl("https://partner.example.com/travel?campaign=summer", "subid", click);
  assert.equal(output, `https://partner.example.com/travel?campaign=summer&subid=${click}`);
  for (const forbidden of ["name", "email", "phone", "lead_id", "comparison_id", "handoff_id", "policy_document", "analytics_session"]) assert.equal(output.includes(forbidden), false);
});

test("analytics rejects all referral and comparison token paths", () => {
  for (const path of ["/go", "/go/abc", `/go/${"x".repeat(43)}`, "/compare", "/compare/private"]) assert.equal(analytics.isAnalyticsPath(path), false, path);
});

test("migration is atomic and creates private append-preserving referral infrastructure", () => {
  const name = readdirSync(join(root, "supabase", "migrations")).find((file) => file.endsWith("_create_partner_referral_infrastructure.sql"));
  assert.ok(name);
  const sql = readFileSync(join(root, "supabase", "migrations", name), "utf8");
  assert.match(sql, /^begin;[\s\S]*commit;\s*$/i);
  for (const table of ["partner_referral_destinations", "partner_referral_links", "partner_referral_clicks"]) {
    assert.match(sql, new RegExp(`create table public\\.${table}`, "i"));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(sql, new RegExp(`revoke all privileges on table public\\.${table} from PUBLIC, anon, authenticated, service_role`, "i"));
  }
  assert.match(sql, /partner_referral_destinations_active_route_idx[\s\S]*coalesce\(country_code, ''\)[\s\S]*where status = 'active'/i);
  assert.doesNotMatch(sql, /grant[^;]*delete/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /insert into public\.partners/i);
});

test("database lifecycle checks fail closed for inactive destination, partner and capability", () => {
  const name = readdirSync(join(root, "supabase", "migrations")).find((file) => file.endsWith("_create_partner_referral_infrastructure.sql"));
  const sql = readFileSync(join(root, "supabase", "migrations", name), "utf8");
  const consume = sql.match(/create function public\.consume_partner_referral_link[\s\S]*?\n\$\$;/i)?.[0] ?? "";
  assert.match(consume, /v_link\.revoked_at is not null or v_link\.expires_at <= now\(\)/i);
  assert.match(consume, /v_destination\.status <> 'active'/i);
  assert.match(consume, /v_partner_status <> 'active'/i);
  assert.match(consume, /partner_capabilities[\s\S]*status = 'active'/i);
  assert.equal((consume.match(/insert into public\.partner_referral_clicks/gi) ?? []).length, 1);
  assert.match(consume, /redirect_status = 'redirected'/i);
  assert.match(consume, /used_count = used_count \+ 1/i);
  assert.doesNotMatch(consume, /affiliate_conversions|commission/i);
});

test("public route cannot accept a caller-supplied destination and returns generic private errors", () => {
  const route = readFileSync(join(root, "app", "go", "[token]", "route.ts"), "utf8");
  assert.match(route, /Partner link unavailable\./);
  assert.match(route, /Referrer-Policy/);
  assert.match(route, /noindex, nofollow, noarchive/);
  assert.match(route, /consumePublicReferralToken\(token\)/);
  assert.doesNotMatch(route, /searchParams|formData|request\.json|[?&]url=/i);
  assert.doesNotMatch(route, /console\.(?:log|warn|error)[^\n]*(?:token|destination|click)/i);
});

test("admin referral mutations use centralized authorization and bounded bodies", () => {
  const rootPath = join(root, "app", "api", "admin");
  const files = [
    join(rootPath, "referral-links", "route.ts"),
    join(rootPath, "referral-links", "[id]", "revoke", "route.ts"),
    join(rootPath, "partners", "[id]", "referral-destinations", "route.ts"),
    join(rootPath, "partners", "[id]", "referral-destinations", "[destinationId]", "route.ts"),
    join(rootPath, "partners", "[id]", "referral-destinations", "[destinationId]", "status", "route.ts"),
  ];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /authorizeAdminOperation\(request\)/, file);
    assert.match(source, /readAdminJsonBody\(request,/, file);
  }
});

test("comparison snapshots expose only a generic availability flag for new shares", () => {
  const snapshot = readFileSync(join(root, "app", "lib", "comparison-share-snapshot.ts"), "utf8");
  const publicData = readFileSync(join(root, "app", "lib", "comparison-public-data.ts"), "utf8");
  assert.match(snapshot, /referral_available/);
  assert.doesNotMatch(snapshot, /destination_url|rawToken|click_reference/);
  assert.match(publicData, /comparison\.version !== publicData\.sourceVersion/);
  assert.match(publicData, /expiryDays: 1/);
});

test("referral UI makes no automatic handoff, conversion, commission or ranking claim", () => {
  const leadPage = readFileSync(join(root, "app", "admin", "(protected)", "leads", "[id]", "page.tsx"), "utf8");
  const view = readFileSync(join(root, "app", "components", "PolicyComparisonView.tsx"), "utf8");
  assert.match(leadPage, /does not transmit lead data/);
  assert.match(view, /independent insurance discovery and referral platform/);
  assert.match(view, /regulated advice and final terms are provided/i);
  assert.doesNotMatch(view, /best offer|recommended|winner|choose this policy/i);
});

test("pre-migration referral loaders fail closed without affecting existing loaders", () => {
  const admin = readFileSync(join(root, "app", "lib", "partner-referral-admin.ts"), "utf8");
  const publicData = readFileSync(join(root, "app", "lib", "comparison-public-data.ts"), "utf8");
  assert.match(admin, /available: false/);
  assert.match(admin, /catch \{/);
  assert.match(publicData, /catch \{/);
  assert.doesNotMatch(readFileSync(join(root, "app", "lib", "admin-dashboard-data.ts"), "utf8"), /partner_referral_/);
});
