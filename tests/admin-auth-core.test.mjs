import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizeAdminLogin,
  resolveAdminAuthorization,
} from "../app/lib/admin-auth-core.ts";

const userId = "00000000-0000-4000-8000-000000000001";

function record(overrides = {}) {
  return {
    user_id: userId,
    role: "admin",
    status: "active",
    display_name: null,
    ...overrides,
  };
}

test("denies when there is no authenticated user", async () => {
  let lookupCalled = false;
  const admin = await resolveAdminAuthorization(null, async () => {
    lookupCalled = true;
    return record();
  });

  assert.equal(admin, null);
  assert.equal(lookupCalled, false);
});

test("denies an authenticated user without an allowlist row", async () => {
  const admin = await resolveAdminAuthorization(userId, async () => null);
  assert.equal(admin, null);
});

test("denies a disabled administrator", async () => {
  const admin = await resolveAdminAuthorization(
    userId,
    async () => record({ status: "disabled" })
  );

  assert.equal(admin, null);
});

test("allows an active admin role", async () => {
  const admin = await resolveAdminAuthorization(
    userId,
    async () => record()
  );

  assert.deepEqual(admin, {
    userId,
    role: "admin",
    displayName: null,
  });
});

test("allows an active owner role", async () => {
  const admin = await resolveAdminAuthorization(
    userId,
    async () => record({ role: "owner", display_name: "Primary admin" })
  );

  assert.deepEqual(admin, {
    userId,
    role: "owner",
    displayName: "Primary admin",
  });
});

test("fails closed when the allowlist lookup throws", async () => {
  const admin = await resolveAdminAuthorization(userId, async () => {
    throw new Error("simulated lookup failure");
  });

  assert.equal(admin, null);
});

test("returns a generic denial for invalid credentials", async () => {
  const result = await authorizeAdminLogin("admin@example.com", "password", {
    signIn: async () => null,
    verifyUser: async () => userId,
    findAdmin: async () => ({ userId, role: "admin", displayName: null }),
    clearSession: async () => {},
  });

  assert.deepEqual(result, { status: "denied" });
});

test("clears a valid Auth session when the user is not allowlisted", async () => {
  let cleared = false;
  const result = await authorizeAdminLogin("admin@example.com", "password", {
    signIn: async () => userId,
    verifyUser: async () => userId,
    findAdmin: async () => null,
    clearSession: async () => {
      cleared = true;
    },
  });

  assert.deepEqual(result, { status: "denied" });
  assert.equal(cleared, true);
});

test("authorizes a verified active administrator session", async () => {
  let cleared = false;
  const currentAdmin = { userId, role: "admin", displayName: null };
  const result = await authorizeAdminLogin("admin@example.com", "password", {
    signIn: async () => userId,
    verifyUser: async () => userId,
    findAdmin: async () => currentAdmin,
    clearSession: async () => {
      cleared = true;
    },
  });

  assert.deepEqual(result, {
    status: "authorized",
    admin: currentAdmin,
  });
  assert.equal(cleared, false);
});

test("denies and clears a session when verified identity differs", async () => {
  let cleared = false;
  const result = await authorizeAdminLogin("admin@example.com", "password", {
    signIn: async () => userId,
    verifyUser: async () => "00000000-0000-4000-8000-000000000002",
    findAdmin: async () => ({ userId, role: "admin", displayName: null }),
    clearSession: async () => {
      cleared = true;
    },
  });

  assert.deepEqual(result, { status: "denied" });
  assert.equal(cleared, true);
});

test("fails closed when privileged allowlist access is unavailable", async () => {
  let cleared = false;
  const result = await authorizeAdminLogin("admin@example.com", "password", {
    signIn: async () => userId,
    verifyUser: async () => userId,
    findAdmin: async () => {
      throw new Error("simulated missing server configuration");
    },
    clearSession: async () => {
      cleared = true;
    },
  });

  assert.deepEqual(result, { status: "unavailable" });
  assert.equal(cleared, true);
});
