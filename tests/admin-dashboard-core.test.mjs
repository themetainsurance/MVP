import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildDirectory = mkdtempSync(join(tmpdir(), "tmi-admin-dashboard-"));
const compiler = join(repositoryRoot, "node_modules", "typescript", "bin", "tsc");

execFileSync(process.execPath, [
  compiler,
  "--target", "ES2022",
  "--module", "commonjs",
  "--moduleResolution", "node",
  "--skipLibCheck",
  "--esModuleInterop",
  "--outDir", buildDirectory,
  join(repositoryRoot, "app", "lib", "admin-dashboard-validation.ts"),
  join(repositoryRoot, "app", "lib", "admin-dashboard-actions.ts"),
], { stdio: "pipe" });

const require = createRequire(import.meta.url);
const validation = require(join(buildDirectory, "admin-dashboard-validation.js"));
const actions = require(join(buildDirectory, "admin-dashboard-actions.js"));

after(() => rmSync(buildDirectory, { recursive: true, force: true }));

const firstId = "00000000-0000-4000-8000-000000000001";
const secondId = "00000000-0000-4000-8000-000000000002";

function validPartner(overrides = {}) {
  return {
    name: "Licensed Partner",
    partner_type: "broker",
    status: "active",
    website_url: "https://partner.example/",
    contact_email: "operations@partner.example",
    handoff_method: "manual",
    affiliate_reference: "partner-ref",
    notes: "Operational record",
    ...overrides,
  };
}

function rpcMock(result = true) {
  const calls = [];
  return {
    calls,
    client: {
      rpc(name, args) {
        calls.push({ name, args });
        return Promise.resolve({ data: result, error: null });
      },
    },
  };
}

test("validates partner creation and rejects invalid domain values", () => {
  assert.equal(validation.validatePartnerInput(validPartner()).success, true);
  assert.equal(validation.validatePartnerInput(validPartner({ partner_type: "carrier" })).success, false);
  assert.equal(validation.validatePartnerInput(validPartner({ status: "deleted" })).success, false);
  assert.equal(validation.validatePartnerInput(validPartner({ website_url: "javascript:alert(1)" })).success, false);
  assert.equal(validation.validatePartnerInput(validPartner({ contact_email: "invalid" })).success, false);
  assert.equal(validation.validatePartnerInput(validPartner({ handoff_method: "webhook" })).success, false);
  assert.equal(validation.validatePartnerInput(validPartner({ notes: "api_key=do-not-store-this" })).success, false);
});

test("validates capability country and insurance constraints", () => {
  assert.equal(validation.validateCapabilityInput({ insurance_type: "travel", country_code: "MK", status: "active" }).success, true);
  assert.equal(validation.validateCapabilityInput({ insurance_type: "health", country_code: "MK", status: "active" }).success, false);
  assert.equal(validation.validateCapabilityInput({ insurance_type: "travel", country_code: "mk", status: "active" }).success, false);
  assert.equal(validation.validateCapabilityInput({ insurance_type: "travel", country_code: "MKEU", status: "active" }).success, false);
});

test("keeps lead PII search valid but bounded for protected request bodies", () => {
  const result = validation.validateLeadListFilters({ insuranceType: "motor", status: "reviewing", search: "person@example.com", page: 2 });
  assert.equal(result.success, true);
  assert.equal(validation.validateLeadListFilters({ insuranceType: "all", status: "all", search: "name),status.eq.completed", page: 1 }).success, false);
});

test("maps lead status changes only to the trusted database function", async () => {
  const mock = rpcMock(false);
  const changed = await actions.changeAdminLeadStatus(mock.client, { leadId: firstId, status: "reviewing", note: "Review started" }, secondId);
  assert.equal(changed, false);
  assert.deepEqual(mock.calls, [{ name: "change_lead_status", args: { p_lead_id: firstId, p_new_status: "reviewing", p_change_source: "admin", p_actor_reference: secondId, p_note: "Review started" } }]);
});

test("maps every handoff lifecycle operation to existing trusted functions", async () => {
  const mock = rpcMock();
  await actions.createAdminHandoff(mock.client, { leadId: firstId, partnerId: secondId, handoffMethod: "manual", note: null });
  await actions.markAdminHandoffSent(mock.client, { handoffId: firstId, externalReference: null, note: null });
  await actions.recordAdminHandoffResponse(mock.client, { handoffId: firstId, status: "accepted", externalReference: null, note: null });
  await actions.recordAdminHandoffResponse(mock.client, { handoffId: firstId, status: "rejected", externalReference: null, note: null });
  await actions.markAdminHandoffFailed(mock.client, { handoffId: firstId, failureCode: "delivery", note: null });
  await actions.cancelAdminHandoff(mock.client, { handoffId: firstId, note: null });
  assert.deepEqual(mock.calls.map((call) => call.name), [
    "create_lead_partner_handoff", "mark_lead_handoff_sent", "record_lead_handoff_response",
    "record_lead_handoff_response", "mark_lead_handoff_failed", "cancel_lead_handoff",
  ]);
  assert.equal(validation.canTransitionHandoff("pending", "send"), true);
  assert.equal(validation.canTransitionHandoff("pending", "cancel"), true);
  assert.equal(validation.canTransitionHandoff("sent", "accept"), true);
  assert.equal(validation.canTransitionHandoff("accepted", "fail"), false);
});

test("maps conversion lifecycle operations without direct lead completion logic", async () => {
  const mock = rpcMock();
  await actions.createAdminConversion(mock.client, { handoffId: firstId, attributionReference: null, externalReference: null, note: null });
  await actions.updateAdminConversionStatus(mock.client, { conversionId: firstId, status: "confirmed", externalReference: null, note: null });
  await actions.updateAdminConversionStatus(mock.client, { conversionId: firstId, status: "rejected", externalReference: null, note: null });
  await actions.updateAdminConversionStatus(mock.client, { conversionId: firstId, status: "reversed", externalReference: null, note: null });
  assert.deepEqual(mock.calls.map((call) => call.name), [
    "create_affiliate_conversion", "update_affiliate_conversion_status",
    "update_affiliate_conversion_status", "update_affiliate_conversion_status",
  ]);
  assert.equal(validation.canTransitionConversion("pending", "confirmed"), true);
  assert.equal(validation.canTransitionConversion("pending", "rejected"), true);
  assert.equal(validation.canTransitionConversion("confirmed", "reversed"), true);
  assert.equal(validation.canTransitionConversion("rejected", "confirmed"), false);
  const source = readFileSync(join(repositoryRoot, "app", "lib", "admin-dashboard-actions.ts"), "utf8");
  assert.equal(source.includes('.from("leads").update'), false);
});

test("validates commission money as strings and exact currency codes", () => {
  for (const amount of ["0", "50", "50.00", "1250.75", "9999999999.99"]) {
    assert.equal(validation.validateCommissionInput({ status: "approved", amount, currency: "EUR", internal_note: "" }).success, true);
  }
  for (const amount of ["-1", "1e3", "NaN", "Infinity", "1.001", "10000000000.00"]) {
    assert.equal(validation.validateCommissionInput({ status: "approved", amount, currency: "EUR", internal_note: "" }).success, false);
  }
  assert.equal(validation.validateCommissionInput({ status: "approved", amount: "50.00", currency: "eur", internal_note: "" }).success, false);
  assert.equal(validation.validateCommissionInput({ status: "paid", amount: "", currency: "", internal_note: "" }).success, false);
  assert.equal(validation.validateCommissionInput({ status: "pending", amount: "", currency: "", internal_note: "" }).success, true);
});

test("enforces commission lifecycle transitions", () => {
  assert.equal(validation.canTransitionCommission("not_reported", "pending"), true);
  assert.equal(validation.canTransitionCommission("pending", "approved"), true);
  assert.equal(validation.canTransitionCommission("approved", "paid"), true);
  assert.equal(validation.canTransitionCommission("paid", "reversed"), true);
  assert.equal(validation.canTransitionCommission("rejected", "paid"), false);
});

test("resolves policy documents only from the lead-owned server lookup", async () => {
  let signedPath = null;
  const missing = await actions.resolveAdminPolicyDocument(firstId, {
    findPolicyPath: async () => ({ found: true, path: null }),
    createSignedUrl: async () => { throw new Error("must not be called"); },
  });
  assert.deepEqual(missing, { status: "not_found" });

  const available = await actions.resolveAdminPolicyDocument(firstId, {
    findPolicyPath: async (leadId) => {
      assert.equal(leadId, firstId);
      return { found: true, path: "motor/server-owned.pdf" };
    },
    createSignedUrl: async (path) => {
      signedPath = path;
      return "https://storage.example/signed";
    },
  });
  assert.equal(signedPath, "motor/server-owned.pdf");
  assert.equal(available.status, "available");
});

test("all operational admin routes use centralized authorization", () => {
  const adminApiRoot = join(repositoryRoot, "app", "api", "admin");
  const routeFiles = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name === "route.ts" && !path.includes(`${join("auth", "login")}`) && !path.includes(`${join("auth", "logout")}`)) routeFiles.push(path);
    }
  }
  visit(adminApiRoot);
  assert.ok(routeFiles.length >= 15);
  for (const path of routeFiles) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /authorizeAdminOperation\(request\)/, path);
  }
});

test("central authorization retains same-origin checks for every operational write", () => {
  const source = readFileSync(join(repositoryRoot, "app", "lib", "admin-api-auth.ts"), "utf8");
  assert.match(source, /POST/);
  assert.match(source, /PATCH/);
  assert.match(source, /DELETE/);
  assert.match(source, /isSameOriginAdminRequest\(request\)/);
  assert.equal(validation.ADMIN_STATUS_BODY_BYTES, 8 * 1024);
  assert.equal(validation.ADMIN_OPERATION_BODY_BYTES, 16 * 1024);
  assert.equal(validation.ADMIN_PARTNER_BODY_BYTES, 32 * 1024);
});

test("policy route accepts no browser-supplied storage path", () => {
  const source = readFileSync(join(repositoryRoot, "app", "api", "admin", "leads", "[id]", "policy-document", "route.ts"), "utf8");
  assert.match(source, /select\("policy_document_path"\)/);
  assert.doesNotMatch(source, /searchParams|get\("path"\)|request\.json|request\.text/);
});
