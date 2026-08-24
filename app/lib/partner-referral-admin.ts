import "server-only";

import { createPrivilegedSupabaseClient } from "./supabase/admin-server";
import { generateReferralToken, hashReferralToken } from "./partner-referral-token-core";
import type {
  PartnerReferralClick,
  PartnerReferralDestination,
  PartnerReferralLink,
  ReferralLinkExpiryDays,
} from "./partner-referral-types";
import type { PartnerInsuranceType } from "./partner-types";

type ReferralSetupResult<T> =
  | { available: true; data: T }
  | { available: false; data: T };

export async function loadAdminPartnerReferralDestinations(
  partnerId: string
): Promise<ReferralSetupResult<PartnerReferralDestination[]>> {
  try {
    const client = createPrivilegedSupabaseClient();
    const { data, error } = await client
      .from("partner_referral_destinations")
      .select("id, created_at, updated_at, partner_id, insurance_type, country_code, status, destination_url, customer_link_label, tracking_parameter_name, external_campaign_reference, internal_note")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    if (error) return { available: false, data: [] };
    return { available: true, data: (data ?? []) as PartnerReferralDestination[] };
  } catch {
    return { available: false, data: [] };
  }
}

export async function loadAdminLeadReferralDestinations(
  insuranceType: PartnerInsuranceType,
  partnerIds: readonly string[]
): Promise<ReferralSetupResult<PartnerReferralDestination[]>> {
  if (!partnerIds.length) return { available: true, data: [] };
  try {
    const client = createPrivilegedSupabaseClient();
    const { data, error } = await client
      .from("partner_referral_destinations")
      .select("id, created_at, updated_at, partner_id, insurance_type, country_code, status, destination_url, customer_link_label, tracking_parameter_name, external_campaign_reference, internal_note")
      .in("partner_id", [...partnerIds])
      .eq("insurance_type", insuranceType)
      .eq("status", "active")
      .is("country_code", null)
      .order("created_at", { ascending: false });
    if (error) return { available: false, data: [] };
    return { available: true, data: (data ?? []) as PartnerReferralDestination[] };
  } catch {
    return { available: false, data: [] };
  }
}

export async function createServerReferralLink(input: {
  destinationId: string;
  expiryDays: ReferralLinkExpiryDays;
  leadId: string | null;
  handoffId: string | null;
  comparisonId: string | null;
  comparisonShareId: string | null;
  actorId: string | null;
}) {
  const rawToken = generateReferralToken();
  const client = createPrivilegedSupabaseClient();
  const { data, error } = await client.rpc("create_partner_referral_link", {
    p_destination_id: input.destinationId,
    p_token_hash: hashReferralToken(rawToken),
    p_expiry_days: input.expiryDays,
    p_lead_id: input.leadId,
    p_handoff_id: input.handoffId,
    p_comparison_id: input.comparisonId,
    p_comparison_share_id: input.comparisonShareId,
    p_actor_id: input.actorId,
  });
  if (error || typeof data !== "string") {
    throw new Error("Referral link could not be created.");
  }
  return { linkId: data, rawToken, path: `/go/${rawToken}` };
}

type ReferralReport = {
  outboundReferrals: number;
  uniqueLinksUsed: number;
  byInsuranceType: Array<{ insurance_type: string; count: number }>;
  byPartner: Array<{ partner_id: string; partner_name: string; count: number }>;
  recentClicks: Array<PartnerReferralClick & { partner_name: string }>;
  recentLinks: PartnerReferralLink[];
};

const EMPTY_REPORT: ReferralReport = {
  outboundReferrals: 0,
  uniqueLinksUsed: 0,
  byInsuranceType: [],
  byPartner: [],
  recentClicks: [],
  recentLinks: [],
};

export async function loadAdminReferralReport(): Promise<ReferralSetupResult<ReferralReport>> {
  try {
    const client = createPrivilegedSupabaseClient();
    const [clicksResult, clickCountResult, linksResult, usedLinkCountResult] = await Promise.all([
      client
        .from("partner_referral_clicks")
        .select("id, created_at, destination_id, partner_id, insurance_type, lead_id, handoff_id, comparison_id, comparison_share_id, redirect_status, redirected_at, partner:partners(name)")
        .eq("redirect_status", "redirected")
        .order("created_at", { ascending: false })
        .limit(5000),
      client
        .from("partner_referral_clicks")
        .select("id", { count: "exact", head: true })
        .eq("redirect_status", "redirected"),
      client
        .from("partner_referral_links")
        .select("id, created_at, expires_at, destination_id, lead_id, handoff_id, comparison_id, comparison_share_id, revoked_at, used_count, last_used_at")
        .order("created_at", { ascending: false })
        .limit(100),
      client
        .from("partner_referral_links")
        .select("id", { count: "exact", head: true })
        .gt("used_count", 0),
    ]);
    if (clicksResult.error || clickCountResult.error || linksResult.error || usedLinkCountResult.error) return { available: false, data: EMPTY_REPORT };
    const clicks = (clicksResult.data ?? []) as Array<PartnerReferralClick & { partner: { name: string } | { name: string }[] | null }>;
    const links = (linksResult.data ?? []) as PartnerReferralLink[];
    const insuranceCounts = new Map<string, number>();
    const partnerCounts = new Map<string, { partner_name: string; count: number }>();
    for (const click of clicks) {
      insuranceCounts.set(click.insurance_type, (insuranceCounts.get(click.insurance_type) ?? 0) + 1);
      const related = Array.isArray(click.partner) ? click.partner[0] : click.partner;
      const current = partnerCounts.get(click.partner_id);
      partnerCounts.set(click.partner_id, {
        partner_name: related?.name ?? "Partner",
        count: (current?.count ?? 0) + 1,
      });
    }
    return { available: true, data: {
      outboundReferrals: clickCountResult.count ?? clicks.length,
      uniqueLinksUsed: usedLinkCountResult.count ?? links.filter((link) => link.used_count > 0).length,
      byInsuranceType: [...insuranceCounts].map(([insurance_type, count]) => ({ insurance_type, count })).sort((a, b) => b.count - a.count),
      byPartner: [...partnerCounts].map(([partner_id, value]) => ({ partner_id, ...value })).sort((a, b) => b.count - a.count),
      recentClicks: clicks.slice(0, 25).map(({ partner, ...click }) => ({ ...click, partner_name: (Array.isArray(partner) ? partner[0] : partner)?.name ?? "Partner" })),
      recentLinks: links.slice(0, 25),
    } };
  } catch {
    return { available: false, data: EMPTY_REPORT };
  }
}
