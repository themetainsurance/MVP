import "server-only";

import { redirect } from "next/navigation";
import { toCurrentAdmin } from "./admin-auth-core";
import { ADMIN_ROLES, type CurrentAdmin } from "./admin-types";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";
import { createServerSupabaseClient } from "./supabase/server";

export async function getActiveAdminByUserId(
  userId: string
): Promise<CurrentAdmin | null> {
  try {
    const privilegedSupabase = createPrivilegedSupabaseClient();
    const { data, error } = await privilegedSupabase
      .from("admin_users")
      .select("user_id, role, status, display_name")
      .eq("user_id", userId)
      .eq("status", "active")
      .in("role", [...ADMIN_ROLES])
      .maybeSingle();

    if (error) {
      throw new Error("Admin allowlist lookup failed.");
    }

    return toCurrentAdmin(userId, data);
  } catch {
    console.error("Admin authorization failed.", {
      code: "admin_authorization_unavailable",
    });

    throw new Error("Admin authorization is unavailable.");
  }
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return await getActiveAdminByUserId(user.id);
  } catch {
    console.error("Admin authorization failed.", {
      code: "admin_identity_verification_unavailable",
    });

    return null;
  }
}

export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
