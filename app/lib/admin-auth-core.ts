export const ADMIN_ROLES = ["owner", "admin"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_STATUSES = ["active", "disabled"] as const;

export type AdminStatus = (typeof ADMIN_STATUSES)[number];

export const ADMIN_DISPLAY_NAME_MAX_LENGTH = 100;

export interface CurrentAdmin {
  userId: string;
  role: AdminRole;
  displayName: string | null;
}

export interface AdminAllowlistRecord {
  user_id: unknown;
  role: unknown;
  status: unknown;
  display_name: unknown;
}

type AdminLookup = (
  userId: string
) => Promise<AdminAllowlistRecord | null>;

export interface AdminLoginDependencies {
  signIn: (email: string, password: string) => Promise<string | null>;
  verifyUser: () => Promise<string | null>;
  findAdmin: (userId: string) => Promise<CurrentAdmin | null>;
  clearSession: () => Promise<void>;
}

export type AdminLoginResult =
  | { status: "authorized"; admin: CurrentAdmin }
  | { status: "denied" }
  | { status: "unavailable" };

function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(value)
  );
}

export function toCurrentAdmin(
  authenticatedUserId: string,
  record: AdminAllowlistRecord | null
): CurrentAdmin | null {
  if (
    !record ||
    record.user_id !== authenticatedUserId ||
    record.status !== "active" ||
    !isAdminRole(record.role)
  ) {
    return null;
  }

  const displayName = record.display_name;
  let safeDisplayName: string | null;

  if (displayName === null) {
    safeDisplayName = null;
  } else if (
    typeof displayName === "string" &&
    displayName.trim().length > 0 &&
    displayName.length <= ADMIN_DISPLAY_NAME_MAX_LENGTH
  ) {
    safeDisplayName = displayName;
  } else {
    return null;
  }

  return {
    userId: authenticatedUserId,
    role: record.role,
    displayName: safeDisplayName,
  };
}

export async function resolveAdminAuthorization(
  authenticatedUserId: string | null,
  lookup: AdminLookup
): Promise<CurrentAdmin | null> {
  if (!authenticatedUserId) {
    return null;
  }

  try {
    return toCurrentAdmin(
      authenticatedUserId,
      await lookup(authenticatedUserId)
    );
  } catch {
    return null;
  }
}

async function safelyClearSession(
  clearSession: () => Promise<void>
) {
  try {
    await clearSession();
  } catch {
    // Authorization remains denied even if remote session revocation fails.
  }
}

export async function authorizeAdminLogin(
  email: string,
  password: string,
  dependencies: AdminLoginDependencies
): Promise<AdminLoginResult> {
  let signedInUserId: string | null;

  try {
    signedInUserId = await dependencies.signIn(email, password);
  } catch {
    return { status: "unavailable" };
  }

  if (!signedInUserId) {
    return { status: "denied" };
  }

  let verifiedUserId: string | null;

  try {
    verifiedUserId = await dependencies.verifyUser();
  } catch {
    await safelyClearSession(dependencies.clearSession);
    return { status: "unavailable" };
  }

  if (!verifiedUserId || verifiedUserId !== signedInUserId) {
    await safelyClearSession(dependencies.clearSession);
    return { status: "denied" };
  }

  let admin: CurrentAdmin | null;

  try {
    admin = await dependencies.findAdmin(verifiedUserId);
  } catch {
    await safelyClearSession(dependencies.clearSession);
    return { status: "unavailable" };
  }

  if (!admin) {
    await safelyClearSession(dependencies.clearSession);
    return { status: "denied" };
  }

  return { status: "authorized", admin };
}
