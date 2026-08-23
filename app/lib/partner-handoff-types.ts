export {
  PARTNER_HANDOFF_METHODS,
  type PartnerHandoffMethod,
} from "./partner-types";

export const PARTNER_HANDOFF_STATUSES = [
  "pending",
  "sent",
  "accepted",
  "rejected",
  "failed",
  "cancelled",
] as const;

export type PartnerHandoffStatus =
  (typeof PARTNER_HANDOFF_STATUSES)[number];

export const PARTNER_HANDOFF_CHANGE_SOURCES = [
  "system",
  "admin",
  "partner",
  "api",
] as const;

export type PartnerHandoffChangeSource =
  (typeof PARTNER_HANDOFF_CHANGE_SOURCES)[number];

export const PARTNER_HANDOFF_EXTERNAL_REFERENCE_MAX_LENGTH = 250;
export const PARTNER_HANDOFF_FAILURE_CODE_MAX_LENGTH = 100;
export const PARTNER_HANDOFF_NOTE_MAX_LENGTH = 1000;
