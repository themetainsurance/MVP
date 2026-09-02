export const PARTNER_TYPES = [
  "insurer",
  "broker",
  "intermediary",
  "affiliate_network",
  "other",
] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];

export const PARTNER_STATUSES = ["active", "inactive"] as const;

export type PartnerStatus = (typeof PARTNER_STATUSES)[number];

export const PARTNER_HANDOFF_METHODS = [
  "manual",
  "email",
  "portal",
  "api",
] as const;

export type PartnerHandoffMethod =
  (typeof PARTNER_HANDOFF_METHODS)[number];

export const PARTNER_INSURANCE_TYPES = [
  "travel",
  "motor",
  "property",
  "health",
] as const;

export type PartnerInsuranceType =
  (typeof PARTNER_INSURANCE_TYPES)[number];
