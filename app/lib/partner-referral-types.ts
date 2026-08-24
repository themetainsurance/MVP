import type { PartnerInsuranceType } from "./partner-types";

export const REFERRAL_DESTINATION_STATUSES = [
  "draft",
  "active",
  "inactive",
] as const;
export type ReferralDestinationStatus =
  (typeof REFERRAL_DESTINATION_STATUSES)[number];

export const REFERRAL_REDIRECT_STATUSES = [
  "created",
  "redirected",
  "blocked",
] as const;
export type ReferralRedirectStatus =
  (typeof REFERRAL_REDIRECT_STATUSES)[number];

export const REFERRAL_LINK_EXPIRY_DAYS = [1, 7, 14, 30] as const;
export type ReferralLinkExpiryDays =
  (typeof REFERRAL_LINK_EXPIRY_DAYS)[number];

export type PartnerReferralDestination = {
  id: string;
  created_at: string;
  updated_at: string;
  partner_id: string;
  insurance_type: PartnerInsuranceType;
  country_code: string | null;
  status: ReferralDestinationStatus;
  destination_url: string;
  customer_link_label: string;
  tracking_parameter_name: string | null;
  external_campaign_reference: string | null;
  internal_note: string | null;
};
export type PartnerReferralLink = {
  id: string;
  created_at: string;
  expires_at: string;
  destination_id: string;
  lead_id: string | null;
  handoff_id: string | null;
  comparison_id: string | null;
  comparison_share_id: string | null;
  revoked_at: string | null;
  used_count: number;
  last_used_at: string | null;
};

export type PartnerReferralClick = {
  id: string;
  created_at: string;
  destination_id: string;
  partner_id: string;
  insurance_type: PartnerInsuranceType;
  lead_id: string | null;
  handoff_id: string | null;
  comparison_id: string | null;
  comparison_share_id: string | null;
  redirect_status: ReferralRedirectStatus;
  redirected_at: string | null;
};
