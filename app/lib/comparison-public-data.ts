import "server-only";

import { hashComparisonShareToken } from "./comparison-token-core";
import type { CustomerComparisonSnapshot } from "./comparison-types";
import { isValidComparisonShareToken } from "./comparison-validation";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";

export async function loadPublicComparisonSnapshot(rawToken: string) {
  if (!isValidComparisonShareToken(rawToken)) return null;
  try {
    const tokenHash = hashComparisonShareToken(rawToken);
    const client = createPrivilegedSupabaseClient();
    const { data, error } = await client
      .from("policy_comparison_shares")
      .select("snapshot, expires_at, revoked_at")
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !data || data.revoked_at) return null;
    return data.snapshot as CustomerComparisonSnapshot;
  } catch {
    console.error("Public comparison lookup unavailable.", {
      code: "public_comparison_lookup_failed",
    });
    return null;
  }
}
