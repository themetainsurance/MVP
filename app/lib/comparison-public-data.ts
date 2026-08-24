import "server-only";

import { hashComparisonShareToken } from "./comparison-token-core";
import type { CustomerComparisonSnapshot } from "./comparison-types";
import { isValidComparisonShareToken } from "./comparison-validation";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";
import { createServerReferralLink } from "./partner-referral-admin";

export type PublicComparisonData = {
  shareId: string;
  comparisonId: string;
  sourceVersion: number;
  snapshot: CustomerComparisonSnapshot;
};

export async function loadPublicComparisonSnapshot(rawToken: string) {
  if (!isValidComparisonShareToken(rawToken)) return null;
  try {
    const tokenHash = hashComparisonShareToken(rawToken);
    const client = createPrivilegedSupabaseClient();
    const { data, error } = await client
      .from("policy_comparison_shares")
      .select("id, comparison_id, source_version, snapshot, expires_at, revoked_at")
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !data || data.revoked_at) return null;
    return {
      shareId: data.id as string,
      comparisonId: data.comparison_id as string,
      sourceVersion: data.source_version as number,
      snapshot: data.snapshot as CustomerComparisonSnapshot,
    } satisfies PublicComparisonData;
  } catch {
    console.error("Public comparison lookup unavailable.", {
      code: "public_comparison_lookup_failed",
    });
    return null;
  }
}

export type PublicReferralCta = { href: string; label: string } | null;

export async function createPublicComparisonReferralCtas(
  publicData: PublicComparisonData
): Promise<PublicReferralCta[]> {
  const { snapshot } = publicData;
  if (!snapshot.offers.some((offer) => offer.referral_available === true)) {
    return snapshot.offers.map(() => null);
  }
  try {
    const client = createPrivilegedSupabaseClient();
    const [comparisonResult, optionsResult] = await Promise.all([
      client.from("policy_comparisons").select("status, version, insurance_type").eq("id", publicData.comparisonId).maybeSingle(),
      client.from("policy_comparison_options").select("id, partner_id, provider_name, product_name, sort_order, created_at").eq("comparison_id", publicData.comparisonId).eq("option_type", "partner_offer").eq("status", "active").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
    ]);
    const comparison = comparisonResult.data;
    const options = optionsResult.data ?? [];
    if (comparisonResult.error || optionsResult.error || !comparison ||
        comparison.status !== "ready" || comparison.version !== publicData.sourceVersion ||
        comparison.insurance_type !== snapshot.insurance_type || options.length !== snapshot.offers.length) {
      return snapshot.offers.map(() => null);
    }
    const partnerIds = options.map((option) => option.partner_id).filter((id): id is string => typeof id === "string");
    const destinationsResult = await client
      .from("partner_referral_destinations")
      .select("id, partner_id, customer_link_label")
      .in("partner_id", partnerIds)
      .eq("insurance_type", snapshot.insurance_type)
      .eq("status", "active")
      .is("country_code", null);
    if (destinationsResult.error) return snapshot.offers.map(() => null);
    const destinations = new Map((destinationsResult.data ?? []).map((destination) => [destination.partner_id as string, destination]));
    return Promise.all(snapshot.offers.map(async (offer, index) => {
      if (offer.referral_available !== true) return null;
      const option = options[index];
      if (!option || option.provider_name !== offer.provider_name ||
          (option.product_name ?? null) !== (offer.product_name ?? null) ||
          typeof option.partner_id !== "string") return null;
      const destination = destinations.get(option.partner_id);
      if (!destination) return null;
      try {
        const link = await createServerReferralLink({
          destinationId: destination.id as string,
          expiryDays: 1,
          leadId: null,
          handoffId: null,
          comparisonId: publicData.comparisonId,
          comparisonShareId: publicData.shareId,
          actorId: null,
        });
        return { href: link.path, label: destination.customer_link_label as string };
      } catch {
        return null;
      }
    }));
  } catch {
    return snapshot.offers.map(() => null);
  }
}
