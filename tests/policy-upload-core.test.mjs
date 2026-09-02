import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const build = mkdtempSync(join(tmpdir(), "tmi-policy-upload-core-"));
const compiler = join(root, "node_modules", "typescript", "bin", "tsc");

execFileSync(
  process.execPath,
  [
    compiler,
    "--target",
    "ES2022",
    "--module",
    "commonjs",
    "--moduleResolution",
    "node",
    "--skipLibCheck",
    "--esModuleInterop",
    "--rootDir",
    join(root, "app"),
    "--outDir",
    build,
    join(root, "app", "api", "upload-policy", "validation.ts"),
    join(root, "app", "api", "leads", "validation.ts"),
    join(root, "app", "lib", "policy-upload-finalization.ts"),
    join(root, "app", "lib", "policy-document-cleanup.ts"),
    join(root, "app", "lib", "policy-upload-request.ts"),
  ],
  { stdio: "pipe" }
);

const require = createRequire(import.meta.url);
const validation = require(join(
  build,
  "api",
  "upload-policy",
  "validation.js"
));
const leadValidation = require(join(
  build,
  "api",
  "leads",
  "validation.js"
));
const finalization = require(join(
  build,
  "lib",
  "policy-upload-finalization.js"
));
const cleanup = require(join(
  build,
  "lib",
  "policy-document-cleanup.js"
));
const requestBody = require(join(
  build,
  "lib",
  "policy-upload-request.js"
));

after(() => rmSync(build, { recursive: true, force: true }));

const sessionId = "00000000-0000-4000-8000-000000000001";
const claimToken = "00000000-0000-4000-8000-000000000002";
const randomObjectId = "a".repeat(32);

function ascii(value) {
  return new TextEncoder().encode(value);
}

const validFiles = {
  pdf: {
    bytes: ascii("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n"),
    mimeType: "application/pdf",
    extension: "pdf",
  },
  jpeg: {
    bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]),
    mimeType: "image/jpeg",
    extension: "jpg",
  },
  png: {
    bytes: new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]),
    mimeType: "image/png",
    extension: "png",
  },
};

function createSession(bytes, overrides = {}) {
  return {
    id: sessionId,
    category: "motor",
    declaredMimeType: "application/pdf",
    declaredSize: bytes.byteLength,
    temporaryPath: `_pending/motor/${"b".repeat(32)}`,
    finalPath: null,
    detectedMimeType: null,
    detectedSize: null,
    claimToken,
    ...overrides,
  };
}

function createFinalizationHarness({
  bytes,
  sessionOverrides,
  claimResult,
  reportedSize,
  moveResult = true,
  removeResult = true,
  reserveResult = true,
  completeResult = true,
  destinationBytes,
}) {
  const session = createSession(bytes ?? new Uint8Array(), sessionOverrides);
  const calls = {
    inspect: [],
    download: [],
    remove: [],
    reserve: [],
    move: [],
    complete: [],
    reject: [],
    release: [],
  };
  const finalBytes = destinationBytes ?? bytes;

  const dependencies = {
    async claimSession() {
      return claimResult ?? { outcome: "claimed", session };
    },
    async inspectObject(path) {
      calls.inspect.push(path);
      if (path === session.temporaryPath) {
        return reportedSize === undefined
          ? bytes?.byteLength ?? null
          : reportedSize;
      }
      if (path === session.finalPath || path.startsWith(`${session.category}/`)) {
        return finalBytes?.byteLength ?? null;
      }
      return null;
    },
    async downloadObject(path) {
      calls.download.push(path);
      if (path === session.temporaryPath) {
        return bytes ? new Blob([bytes]) : null;
      }
      return finalBytes ? new Blob([finalBytes]) : null;
    },
    async removeTemporaryObject(path) {
      calls.remove.push(path);
      return removeResult;
    },
    async reserveFinalPath(...args) {
      calls.reserve.push(args);
      return reserveResult;
    },
    async moveObject(...args) {
      calls.move.push(args);
      return moveResult;
    },
    async completeSession(...args) {
      calls.complete.push(args);
      return completeResult;
    },
    async rejectSession(...args) {
      calls.reject.push(args);
      return true;
    },
    async releaseClaim(...args) {
      calls.release.push(args);
    },
    createRandomObjectId() {
      return randomObjectId;
    },
  };

  return { calls, dependencies, session };
}

test("initiate accepts only strict Motor/Property/Health metadata", () => {
  for (const category of ["motor", "property", "health"]) for (const mime_type of [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ]) {
    const result = validation.validateUploadInitiationBody({
      category,
      mime_type,
      size: 1,
    });
    assert.equal(result.success, true, `${category}:${mime_type}`);
  }

  for (const body of [
    { category: "travel", mime_type: "application/pdf", size: 1 },
    { category: "motor", mime_type: "image/svg+xml", size: 1 },
    { category: "motor", mime_type: "text/html", size: 1 },
    { category: "motor", mime_type: "application/octet-stream", size: 1 },
    { category: "motor", mime_type: "application/pdf", size: 0 },
    {
      category: "motor",
      mime_type: "application/pdf",
      size: 1,
      filename: "customer.pdf",
    },
    {
      category: "motor",
      mime_type: "application/pdf",
      size: 1,
      path: "motor/chosen.pdf",
    },
  ]) {
    assert.equal(
      validation.validateUploadInitiationBody(body).success,
      false,
      JSON.stringify(body)
    );
  }
});

test("the 10 MB binary boundary remains exact", () => {
  const exact = validation.validateUploadInitiationBody({
    category: "property",
    mime_type: "application/pdf",
    size: 10 * 1024 * 1024,
  });
  const over = validation.validateUploadInitiationBody({
    category: "property",
    mime_type: "application/pdf",
    size: 10 * 1024 * 1024 + 1,
  });
  assert.equal(exact.success, true);
  assert.equal(over.success, false);
  assert.equal(validation.MAX_FILE_SIZE_BYTES, 10 * 1024 * 1024);
});

test("finalize accepts only one UUID field and no client paths", () => {
  assert.equal(
    validation.validateUploadFinalizationBody({
      upload_session_id: sessionId,
    }).success,
    true
  );

  for (const body of [
    { upload_session_id: "not-a-uuid" },
    { upload_session_id: sessionId, path: "_pending/motor/tampered" },
    { upload_session_id: sessionId, final_path: "motor/tampered.pdf" },
    { path: "_pending/motor/tampered" },
  ]) {
    assert.equal(
      validation.validateUploadFinalizationBody(body).success,
      false
    );
  }
});

test("upload application endpoints accept only bounded JSON bodies", async () => {
  const valid = await requestBody.readPolicyUploadJsonBody(
    new Request("https://www.themetainsurance.com/api/upload-policy/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        category: "motor",
        mime_type: "application/pdf",
        size: 128,
      }),
    })
  );
  assert.equal(valid.success, true);

  const multipart = await requestBody.readPolicyUploadJsonBody(
    new Request("https://www.themetainsurance.com/api/upload-policy/initiate", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data; boundary=x" },
      body: "--x--",
    })
  );
  assert.deepEqual(multipart, { success: false, status: 400 });

  const oversized = await requestBody.readPolicyUploadJsonBody(
    new Request("https://www.themetainsurance.com/api/upload-policy/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: "x".repeat(8192) }),
    })
  );
  assert.deepEqual(oversized, { success: false, status: 413 });
});

for (const [kind, file] of Object.entries(validFiles)) {
  test(`finalization accepts a real ${kind.toUpperCase()} signature`, async () => {
    const harness = createFinalizationHarness({
      bytes: file.bytes,
      sessionOverrides: { declaredMimeType: file.mimeType },
    });
    const result = await finalization.finalizePolicyUpload(
      sessionId,
      harness.dependencies
    );

    assert.deepEqual(result, {
      status: "finalized",
      path: `motor/${randomObjectId}.${file.extension}`,
      idempotent: false,
    });
    assert.equal(harness.calls.reserve.length, 1);
    assert.equal(harness.calls.move.length, 1);
    assert.equal(harness.calls.complete.length, 1);
    assert.equal(harness.calls.reject.length, 0);
  });
}

test("empty, binary, SVG, HTML and MIME-forged objects are rejected", async () => {
  const invalidCases = [
    { bytes: new Uint8Array(), mime: "application/pdf", size: 0 },
    { bytes: new Uint8Array([1, 2, 3, 4]), mime: "application/pdf" },
    { bytes: ascii("<svg xmlns='http://www.w3.org/2000/svg'></svg>"), mime: "image/png" },
    { bytes: ascii("<!doctype html><title>not a policy</title>"), mime: "application/pdf" },
    { bytes: validFiles.png.bytes, mime: "image/jpeg" },
    { bytes: validFiles.jpeg.bytes, mime: "application/pdf" },
  ];

  for (const invalid of invalidCases) {
    const harness = createFinalizationHarness({
      bytes: invalid.bytes,
      reportedSize: invalid.size,
      sessionOverrides: {
        declaredMimeType: invalid.mime,
        declaredSize: invalid.bytes.byteLength || 1,
      },
    });
    const result = await finalization.finalizePolicyUpload(
      sessionId,
      harness.dependencies
    );
    assert.equal(result.status, "invalid", invalid.mime);
    assert.equal(harness.calls.remove.length, 1);
    assert.equal(harness.calls.reject.length, 1);
    assert.equal(harness.calls.move.length, 0);
  }
});

test("oversized stored objects are rejected before server download", async () => {
  const harness = createFinalizationHarness({
    bytes: validFiles.pdf.bytes,
    reportedSize: validation.MAX_FILE_SIZE_BYTES + 1,
    sessionOverrides: {
      declaredMimeType: "application/pdf",
      declaredSize: validation.MAX_FILE_SIZE_BYTES,
    },
  });
  const result = await finalization.finalizePolicyUpload(
    sessionId,
    harness.dependencies
  );
  assert.equal(result.status, "invalid");
  assert.equal(harness.calls.download.length, 0);
  assert.equal(harness.calls.remove.length, 1);
});

test("actual Storage size must equal the declared size", async () => {
  const harness = createFinalizationHarness({
    bytes: validFiles.pdf.bytes,
    sessionOverrides: {
      declaredMimeType: "application/pdf",
      declaredSize: validFiles.pdf.bytes.byteLength + 1,
    },
  });
  const result = await finalization.finalizePolicyUpload(
    sessionId,
    harness.dependencies
  );
  assert.equal(result.status, "invalid");
  assert.equal(harness.calls.download.length, 0);
});

test("downloaded object length must equal authoritative Storage metadata", async () => {
  const reportedSize = validFiles.pdf.bytes.byteLength + 1;
  const harness = createFinalizationHarness({
    bytes: validFiles.pdf.bytes,
    reportedSize,
    sessionOverrides: {
      declaredMimeType: "application/pdf",
      declaredSize: reportedSize,
    },
  });
  const result = await finalization.finalizePolicyUpload(
    sessionId,
    harness.dependencies
  );
  assert.equal(result.status, "invalid");
  assert.equal(harness.calls.download.length, 1);
  assert.equal(harness.calls.move.length, 0);
});

test("expired sessions cannot inspect, download, move or finalize objects", async () => {
  const harness = createFinalizationHarness({
    bytes: validFiles.pdf.bytes,
    claimResult: { outcome: "expired" },
  });
  const result = await finalization.finalizePolicyUpload(
    sessionId,
    harness.dependencies
  );
  assert.deepEqual(result, { status: "expired" });
  assert.equal(harness.calls.inspect.length, 0);
  assert.equal(harness.calls.move.length, 0);
  assert.equal(harness.calls.complete.length, 0);
});

test("already finalized sessions are idempotent and create no duplicate", async () => {
  const finalPath = `motor/${randomObjectId}.pdf`;
  const harness = createFinalizationHarness({
    bytes: validFiles.pdf.bytes,
    claimResult: { outcome: "finalized", finalPath },
  });
  const result = await finalization.finalizePolicyUpload(
    sessionId,
    harness.dependencies
  );
  assert.deepEqual(result, {
    status: "finalized",
    path: finalPath,
    idempotent: true,
  });
  assert.equal(harness.calls.inspect.length, 0);
  assert.equal(harness.calls.reserve.length, 0);
  assert.equal(harness.calls.move.length, 0);
});

test("a failed Storage move never marks the session finalized", async () => {
  const harness = createFinalizationHarness({
    bytes: validFiles.pdf.bytes,
    sessionOverrides: { declaredMimeType: "application/pdf" },
    moveResult: false,
    destinationBytes: undefined,
  });
  const originalInspect = harness.dependencies.inspectObject;
  harness.dependencies.inspectObject = async (path) =>
    path.startsWith("motor/") ? null : originalInspect(path);

  const result = await finalization.finalizePolicyUpload(
    sessionId,
    harness.dependencies
  );
  assert.equal(result.status, "failed");
  assert.equal(harness.calls.complete.length, 0);
  assert.equal(harness.calls.release.length, 1);
});

test("a retry can finish a move whose destination already exists", async () => {
  const finalPath = `motor/${randomObjectId}.pdf`;
  const harness = createFinalizationHarness({
    bytes: undefined,
    destinationBytes: validFiles.pdf.bytes,
    sessionOverrides: {
      declaredMimeType: "application/pdf",
      declaredSize: validFiles.pdf.bytes.byteLength,
      finalPath,
      detectedMimeType: "application/pdf",
      detectedSize: validFiles.pdf.bytes.byteLength,
    },
  });
  const result = await finalization.finalizePolicyUpload(
    sessionId,
    harness.dependencies
  );
  assert.equal(result.status, "finalized");
  assert.equal(result.path, finalPath);
  assert.equal(harness.calls.move.length, 0);
  assert.equal(harness.calls.complete.length, 1);
});

test("Motor, Property and Health bytes go only to Supabase signed upload", () => {
  const client = readFileSync(
    join(root, "app", "lib", "policy-upload-client.ts"),
    "utf8"
  );
  const motor = readFileSync(join(root, "app", "motor", "page.tsx"), "utf8");
  const property = readFileSync(
    join(root, "app", "property", "page.tsx"),
    "utf8"
  );
  const initiate = readFileSync(
    join(root, "app", "api", "upload-policy", "initiate", "route.ts"),
    "utf8"
  );
  const finalize = readFileSync(
    join(root, "app", "api", "upload-policy", "finalize", "route.ts"),
    "utf8"
  );
  const legacy = readFileSync(
    join(root, "app", "api", "upload-policy", "route.ts"),
    "utf8"
  );
  const server = readFileSync(
    join(root, "app", "lib", "policy-upload-server.ts"),
    "utf8"
  );

  assert.match(client, /uploadToSignedUrl\([\s\S]*?file,/);
  assert.match(client, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(client, /uploadToSignedUrl\([\s\S]*?upsert: false/);
  assert.match(client, /body: JSON\.stringify\(\{[\s\S]*?mime_type: file\.type,[\s\S]*?size: file\.size/);
  assert.match(client, /body: JSON\.stringify\(\{[\s\S]*?upload_session_id:/);
  assert.doesNotMatch(client, /FormData|SUPABASE_SECRET_KEY|service[_ -]?role|analytics/i);

  const health = readFileSync(join(root, "app", "health", "page.tsx"), "utf8");
  for (const page of [motor, property, health]) {
    assert.match(page, /uploadPolicyDocumentDirectly/);
    assert.doesNotMatch(page, /FormData|fetch\(\s*["']\/api\/upload-policy["']/);
    assert.match(page, /10 \* 1024 \* 1024/);
  }
  for (const route of [initiate, finalize]) {
    assert.match(route, /readPolicyUploadJsonBody/);
    assert.match(route, /isSameOriginRequest/);
    assert.doesNotMatch(route, /formData\(|File\b|arrayBuffer\(/);
  }
  assert.match(legacy, /status: 410/);
  assert.doesNotMatch(legacy, /formData\(|File\b|arrayBuffer\(/);
  assert.match(server, /_pending\/\$\{input\.category\}\/\$\{createRandomObjectId\(\)\}/);
  assert.match(server, /createSignedUploadUrl\(temporaryPath, \{[\s\S]*?upsert: false/);
  assert.match(server, /POLICY_UPLOAD_SESSION_MINUTES/);
});

test("lead paths accept only matching finalized namespaces", () => {
  const base = {
    insurance_type: "motor",
    full_name: "Test User",
    email: "test@example.com",
    phone: null,
    preferred_contact: "email",
    policy_document_path: `motor/${randomObjectId}.pdf`,
    consent: true,
    details: {},
    analytics_session_id: null,
  };
  assert.equal(leadValidation.validateLeadBody(base).success, true);

  for (const path of [
    `_pending/motor/${randomObjectId}`,
    `property/${randomObjectId}.pdf`,
    "motor/../../private.pdf",
    "motor/customer-name.pdf",
    "https://example.com/policy.pdf",
  ]) {
    assert.equal(
      leadValidation.validateLeadBody({
        ...base,
        policy_document_path: path,
      }).success,
      false,
      path
    );
  }
});

function createCleanupSupabase({
  candidates = [],
  candidateError = null,
  linkedFinalPath = null,
}) {
  const removed = [];
  const completed = [];
  const now = "2026-08-25T00:00:00.000Z";
  const finalObject = linkedFinalPath
    ? [{ id: "object-id", name: linkedFinalPath.split("/")[1], created_at: "2026-01-01T00:00:00.000Z" }]
    : [];

  const supabase = {
    rpc(name, args) {
      if (name === "claim_policy_upload_cleanup_candidates") {
        assert.equal(args.p_expired_before, "2026-08-24T21:00:00.000Z");
        return Promise.resolve({ data: candidateError ? null : candidates, error: candidateError });
      }
      if (name === "complete_policy_upload_cleanup") {
        completed.push(...args.p_session_ids);
        return Promise.resolve({ data: args.p_session_ids.length, error: null });
      }
      throw new Error(`Unexpected RPC ${name}`);
    },
    from(table) {
      assert.equal(table, "leads");
      const query = {
        select() { return query; },
        not() { return query; },
        order() { return query; },
        range() {
          return Promise.resolve({
            data: linkedFinalPath
              ? [{ policy_document_path: linkedFinalPath }]
              : [],
            error: null,
          });
        },
      };
      return query;
    },
    storage: {
      from(bucketName) {
        assert.equal(bucketName, "policy-documents");
        return {
          remove(paths) {
            removed.push(...paths);
            return Promise.resolve({
              data: paths.map((name) => ({ name })),
              error: null,
            });
          },
          list(prefix) {
            return Promise.resolve({
              data:
                linkedFinalPath?.startsWith(`${prefix}/`)
                  ? finalObject
                  : [],
              error: null,
            });
          },
        };
      },
    },
  };

  return { completed, now, removed, supabase };
}

test("cleanup removes stale temp candidates but preserves linked final objects", async () => {
  const temporaryPath = `_pending/motor/${"c".repeat(32)}`;
  const finalPath = `motor/${"d".repeat(32)}.pdf`;
  const mocked = createCleanupSupabase({
    candidates: [
      {
        upload_session_id: "00000000-0000-4000-8000-000000000003",
        temporary_path: temporaryPath,
      },
    ],
    linkedFinalPath: finalPath,
  });
  const summary = await cleanup.cleanupPolicyDocuments(mocked.supabase, {
    now: new Date(mocked.now),
    graceHours: 24,
    temporaryGraceHours: 3,
  });

  assert.equal(summary.temporaryScanned, 1);
  assert.equal(summary.temporaryDeleted, 1);
  assert.deepEqual(mocked.removed, [temporaryPath]);
  assert.deepEqual(mocked.completed, [
    "00000000-0000-4000-8000-000000000003",
  ]);
  assert.equal(summary.linked, 1);
  assert.equal(summary.deleted, 0);
});

test("cleanup remains deploy-safe before the upload migration", async () => {
  const mocked = createCleanupSupabase({
    candidateError: { code: "42883" },
  });
  const summary = await cleanup.cleanupPolicyDocuments(mocked.supabase, {
    now: new Date(mocked.now),
  });
  assert.equal(summary.temporaryCleanupAvailable, false);
  assert.equal(summary.temporaryDeleted, 0);
});

test("migration creates a PII-free server-only lifecycle and race-safe cleanup", () => {
  const migrationName = readdirSync(join(root, "supabase", "migrations")).find(
    (name) => name.endsWith("_create_policy_upload_sessions.sql")
  );
  assert.ok(migrationName);
  const sql = readFileSync(
    join(root, "supabase", "migrations", migrationName),
    "utf8"
  );

  assert.match(sql, /^begin;[\s\S]*commit;\s*$/i);
  assert.match(sql, /create table public\.policy_upload_sessions/i);
  assert.match(sql, /status in \('pending', 'finalized', 'rejected', 'expired'\)/i);
  assert.match(sql, /declared_size between 1 and 10485760/i);
  assert.match(sql, /expires_at <= created_at \+ interval '30 minutes'/i);
  assert.match(
    sql,
    /\^_pending\/\(motor\|property\)\/\[0-9a-f\]\{32\}\$/i
  );
  assert.match(sql, /alter table public\.policy_upload_sessions enable row level security/i);
  assert.match(sql, /revoke all privileges on table public\.policy_upload_sessions[\s\S]*?PUBLIC, anon, authenticated, service_role/i);
  assert.match(sql, /grant select, insert, update on table public\.policy_upload_sessions[\s\S]*?service_role/i);
  assert.doesNotMatch(sql, /grant[^;]*(?:anon|authenticated)|create policy|storage\.objects|storage\.buckets/i);
  assert.match(sql, /security invoker[\s\S]*?set search_path = ''/i);
  assert.match(sql, /for update skip locked/i);
  assert.match(sql, /sessions\.status = 'pending'[\s\S]*?sessions\.expires_at <= p_expired_before/i);
  assert.match(sql, /sessions\.status = 'finalized'[\s\S]*?sessions\.updated_at <= p_expired_before/i);
  assert.doesNotMatch(sql, /\b(full_name|email|phone|filename|user_agent|ip_address)\b/i);
  assert.doesNotMatch(sql, /\binsert into\b|\bcopy\b/i);
});

test("upload routes and logs contain no secret values or customer identifiers", () => {
  const files = [
    join(root, "app", "api", "upload-policy", "initiate", "route.ts"),
    join(root, "app", "api", "upload-policy", "finalize", "route.ts"),
    join(root, "app", "lib", "policy-upload-client.ts"),
  ];
  const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(source, /console\.(?:log|info|warn|error)\([^)]*(?:token|path|filename|email|phone)/i);
  assert.doesNotMatch(
    readFileSync(join(root, "app", "lib", "policy-upload-client.ts"), "utf8"),
    /SUPABASE_SECRET_KEY|CRON_SECRET|createPrivilegedSupabaseClient/
  );
});
