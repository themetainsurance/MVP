export const LEAD_STATUSES = [
  "new",
  "reviewing",
  "sent_to_partner",
  "completed",
  "rejected",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_CHANGE_SOURCES = [
  "system",
  "admin",
  "partner",
  "api",
  "migration",
] as const;

export type LeadStatusChangeSource =
  (typeof LEAD_STATUS_CHANGE_SOURCES)[number];

export const LEAD_STATUS_ACTOR_REFERENCE_MAX_LENGTH = 200;
export const LEAD_STATUS_NOTE_MAX_LENGTH = 1000;
