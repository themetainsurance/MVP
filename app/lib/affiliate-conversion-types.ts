export const AFFILIATE_CONVERSION_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "reversed",
] as const;

export type AffiliateConversionStatus =
  (typeof AFFILIATE_CONVERSION_STATUSES)[number];

export const AFFILIATE_COMMISSION_STATUSES = [
  "not_reported",
  "pending",
  "approved",
  "paid",
  "rejected",
  "reversed",
] as const;

export type AffiliateCommissionStatus =
  (typeof AFFILIATE_COMMISSION_STATUSES)[number];

export const AFFILIATE_CONVERSION_CHANGE_SOURCES = [
  "system",
  "admin",
  "partner",
  "api",
] as const;

export type AffiliateConversionChangeSource =
  (typeof AFFILIATE_CONVERSION_CHANGE_SOURCES)[number];

export const AFFILIATE_ATTRIBUTION_REFERENCE_MAX_LENGTH = 250;
export const AFFILIATE_EXTERNAL_CONVERSION_REFERENCE_MAX_LENGTH = 250;
export const AFFILIATE_CONVERSION_NOTE_MAX_LENGTH = 1000;
