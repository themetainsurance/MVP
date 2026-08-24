import "server-only";

import { createPrivilegedSupabaseClient } from "./supabase/admin-server";
import { hashReferralToken } from "./partner-referral-token-core";
import { buildPartnerReferralUrl } from "./partner-referral-url";

type ConsumedReferral = {
  destination_url: string;
  tracking_parameter_name: string | null;
  click_reference: string;
};

export async function consumePublicReferralToken(rawToken: string) {
  try {
    const client = createPrivilegedSupabaseClient();
    const { data, error } = await client.rpc("consume_partner_referral_link", {
      p_token_hash: hashReferralToken(rawToken),
    });
    const row = Array.isArray(data) ? data[0] as ConsumedReferral | undefined : undefined;
    if (error || !row) return null;
    return buildPartnerReferralUrl(
      row.destination_url,
      row.tracking_parameter_name,
      row.click_reference
    );
  } catch {
    console.error("Partner referral redirect failed.", {
      code: "partner_referral_redirect_failed",
    });
    return null;
  }
}
