import "server-only";

import type { AdminRpcClient } from "./admin-dashboard-actions";
import { buildCustomerComparisonSnapshot } from "./comparison-share-snapshot";
import {
  generateComparisonShareToken,
  hashComparisonShareToken,
} from "./comparison-token-core";
import type { PolicyComparison, PolicyComparisonOption } from "./comparison-types";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";

async function loadReferralOptionIds(
  comparison: PolicyComparison,
  options: readonly PolicyComparisonOption[]
) {
  const offers = options.filter(
    (option) => option.status === "active" &&
      option.option_type === "partner_offer" && option.partner_id
  );
  if (!offers.length) return new Set<string>();
  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("partner_referral_destinations")
      .select("partner_id")
      .in("partner_id", offers.map((offer) => offer.partner_id as string))
      .eq("insurance_type", comparison.insurance_type)
      .eq("status", "active")
      .is("country_code", null);
    if (error) return new Set<string>();
    const availablePartners = new Set((data ?? []).map((row) => row.partner_id as string));
    return new Set(offers.filter((offer) => availablePartners.has(offer.partner_id as string)).map((offer) => offer.id));
  } catch {
    return new Set<string>();
  }
}

export async function createAdminComparisonShare(
  client: AdminRpcClient,
  comparison: PolicyComparison,
  options: readonly PolicyComparisonOption[],
  expiryDays: number,
  actorId: string
) {
  const rawToken = generateComparisonShareToken();
  const tokenHash = hashComparisonShareToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + expiryDays);
  const referralOptionIds = await loadReferralOptionIds(comparison, options);
  const snapshot = buildCustomerComparisonSnapshot(
    comparison,
    options,
    now.toISOString(),
    referralOptionIds
  );
  const { data, error } = await client.rpc("create_policy_comparison_share", {
    p_comparison_id: comparison.id,
    p_token_hash: tokenHash,
    p_expires_at: expiresAt.toISOString(),
    p_source_version: comparison.version,
    p_snapshot: snapshot,
    p_actor_id: actorId,
  });
  if (error) throw new Error("Trusted comparison operation failed.");
  return { shareId: data, rawToken, expiresAt: expiresAt.toISOString() };
}
