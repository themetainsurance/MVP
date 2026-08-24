import {
  AFFILIATE_ATTRIBUTION_REFERENCE_MAX_LENGTH,
  AFFILIATE_COMMISSION_STATUSES,
  AFFILIATE_CONVERSION_NOTE_MAX_LENGTH,
  AFFILIATE_CONVERSION_STATUSES,
  AFFILIATE_EXTERNAL_CONVERSION_REFERENCE_MAX_LENGTH,
  type AffiliateCommissionStatus,
  type AffiliateConversionStatus,
} from "./affiliate-conversion-types";
import {
  LEAD_STATUSES,
  LEAD_STATUS_NOTE_MAX_LENGTH,
  type LeadStatus,
} from "./lead-status-types";
import {
  PARTNER_HANDOFF_EXTERNAL_REFERENCE_MAX_LENGTH,
  PARTNER_HANDOFF_FAILURE_CODE_MAX_LENGTH,
  PARTNER_HANDOFF_NOTE_MAX_LENGTH,
  PARTNER_HANDOFF_STATUSES,
  type PartnerHandoffStatus,
} from "./partner-handoff-types";
import {
  PARTNER_HANDOFF_METHODS,
  PARTNER_INSURANCE_TYPES,
  PARTNER_STATUSES,
  PARTNER_TYPES,
  type PartnerHandoffMethod,
  type PartnerInsuranceType,
  type PartnerStatus,
  type PartnerType,
} from "./partner-types";

export const ADMIN_STATUS_BODY_BYTES = 8 * 1024;
export const ADMIN_OPERATION_BODY_BYTES = 16 * 1024;
export const ADMIN_PARTNER_BODY_BYTES = 32 * 1024;
export const ADMIN_PAGE_SIZE = 25;
export const ADMIN_MAX_PAGE = 10_000;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEAD_SEARCH_PATTERN = /^[\p{L}\p{N}@._+\-' ]+$/u;
const MONEY_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;
const COUNTRY_PATTERN = /^[A-Z]{2,3}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const OBVIOUS_SECRET_PATTERN =
  /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:api[_ -]?key|password|secret|access[_ -]?token|refresh[_ -]?token|credential)\s*[:=]|\bsb_secret_[A-Za-z0-9_-]+|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/i;

type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; error: string };
export type AdminValidationResult<T> =
  | ValidationSuccess<T>
  | ValidationFailure;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function onlyHasKeys(value: Record<string, unknown>, keys: string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function requiredText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function optionalText(
  value: unknown,
  maxLength: number
): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.length <= maxLength ? normalized : undefined;
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

export function isAdminUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function normalizeAdminPage(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isSafeInteger(parsed) && Number(parsed) >= 1
    ? Math.min(Number(parsed), ADMIN_MAX_PAGE)
    : 1;
}

export type LeadListFilters = {
  insuranceType: PartnerInsuranceType | null;
  status: LeadStatus | null;
  search: string | null;
  page: number;
};

export function validateLeadListFilters(
  value: unknown
): AdminValidationResult<LeadListFilters> {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["insuranceType", "status", "search", "page"])
  ) {
    return { success: false, error: "Invalid request." };
  }

  const insuranceType =
    value.insuranceType === "all" || value.insuranceType == null
      ? null
      : value.insuranceType;
  const status =
    value.status === "all" || value.status == null ? null : value.status;
  const search = optionalText(value.search, 100);

  if (
    (insuranceType !== null &&
      !isOneOf(insuranceType, PARTNER_INSURANCE_TYPES)) ||
    (status !== null && !isOneOf(status, LEAD_STATUSES)) ||
    search === undefined ||
    (search !== null && !LEAD_SEARCH_PATTERN.test(search))
  ) {
    return { success: false, error: "Invalid request." };
  }

  return {
    success: true,
    data: {
      insuranceType: insuranceType as PartnerInsuranceType | null,
      status: status as LeadStatus | null,
      search,
      page: normalizeAdminPage(value.page),
    },
  };
}

export function validateLeadStatusInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["status", "note"]) ||
    !isOneOf(value.status, LEAD_STATUSES)
  ) {
    return { success: false, error: "Invalid request." } as const;
  }

  const note = optionalText(value.note, LEAD_STATUS_NOTE_MAX_LENGTH);
  if (note === undefined) {
    return { success: false, error: "Invalid request." } as const;
  }

  return {
    success: true,
    data: { status: value.status, note },
  } as const;
}

export type PartnerInput = {
  name: string;
  partner_type: PartnerType;
  status: PartnerStatus;
  website_url: string | null;
  contact_email: string | null;
  handoff_method: PartnerHandoffMethod;
  affiliate_reference: string | null;
  notes: string | null;
};

function validateWebsiteUrl(value: unknown) {
  const normalized = optionalText(value, 2048);
  if (normalized === undefined || normalized === null) return normalized;

  try {
    const url = new URL(normalized);
    const sensitiveQuery = [...url.searchParams.keys()].some((key) =>
      /^(?:api[_-]?key|password|secret|token|credential)$/i.test(key)
    );
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      sensitiveQuery
    ) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

export function validatePartnerInput(
  value: unknown
): AdminValidationResult<PartnerInput> {
  const allowedKeys = [
    "name",
    "partner_type",
    "status",
    "website_url",
    "contact_email",
    "handoff_method",
    "affiliate_reference",
    "notes",
  ];

  if (!isPlainObject(value) || !onlyHasKeys(value, allowedKeys)) {
    return { success: false, error: "Invalid request." };
  }

  const name = requiredText(value.name, 200);
  const websiteUrl = validateWebsiteUrl(value.website_url);
  const email = optionalText(value.contact_email, 254);
  const affiliateReference = optionalText(value.affiliate_reference, 250);
  const notes = optionalText(value.notes, 2000);

  if (
    !name ||
    !isOneOf(value.partner_type, PARTNER_TYPES) ||
    !isOneOf(value.status, PARTNER_STATUSES) ||
    !isOneOf(value.handoff_method, PARTNER_HANDOFF_METHODS) ||
    websiteUrl === undefined ||
    email === undefined ||
    (email !== null && !EMAIL_PATTERN.test(email)) ||
    affiliateReference === undefined ||
    notes === undefined ||
    [name, affiliateReference, notes].some(
      (field) => field !== null && OBVIOUS_SECRET_PATTERN.test(field)
    )
  ) {
    return { success: false, error: "Invalid request." };
  }

  return {
    success: true,
    data: {
      name,
      partner_type: value.partner_type,
      status: value.status,
      website_url: websiteUrl,
      contact_email: email?.toLowerCase() ?? null,
      handoff_method: value.handoff_method,
      affiliate_reference: affiliateReference,
      notes,
    },
  };
}

export function validateCapabilityInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["insurance_type", "country_code", "status"]) ||
    !isOneOf(value.insurance_type, PARTNER_INSURANCE_TYPES) ||
    !isOneOf(value.status, PARTNER_STATUSES)
  ) {
    return { success: false, error: "Invalid request." } as const;
  }

  const countryCode =
    typeof value.country_code === "string"
      ? value.country_code.trim()
      : "";
  if (!COUNTRY_PATTERN.test(countryCode)) {
    return { success: false, error: "Invalid request." } as const;
  }

  return {
    success: true,
    data: {
      insurance_type: value.insurance_type,
      country_code: countryCode,
      status: value.status,
    },
  } as const;
}

export function validateCapabilityStatusInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["status"]) ||
    !isOneOf(value.status, PARTNER_STATUSES)
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  return { success: true, data: { status: value.status } } as const;
}

export function validateCreateHandoffInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["partner_id", "handoff_method", "internal_note"]) ||
    !isAdminUuid(value.partner_id)
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  const method =
    value.handoff_method === "" || value.handoff_method == null
      ? null
      : value.handoff_method;
  const note = optionalText(value.internal_note, PARTNER_HANDOFF_NOTE_MAX_LENGTH);
  if (
    (method !== null && !isOneOf(method, PARTNER_HANDOFF_METHODS)) ||
    note === undefined
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  return {
    success: true,
    data: {
      partnerId: value.partner_id,
      handoffMethod: method as PartnerHandoffMethod | null,
      note,
    },
  } as const;
}

export function validateHandoffSendInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["external_reference", "internal_note"])
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  const externalReference = optionalText(
    value.external_reference,
    PARTNER_HANDOFF_EXTERNAL_REFERENCE_MAX_LENGTH
  );
  const note = optionalText(value.internal_note, PARTNER_HANDOFF_NOTE_MAX_LENGTH);
  if (externalReference === undefined || note === undefined) {
    return { success: false, error: "Invalid request." } as const;
  }
  return {
    success: true,
    data: { externalReference, note },
  } as const;
}

export function validateHandoffResponseInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["status", "external_reference", "internal_note"]) ||
    (value.status !== "accepted" && value.status !== "rejected")
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  const base = validateHandoffSendInput({
    external_reference: value.external_reference,
    internal_note: value.internal_note,
  });
  if (base.success === false) return base;
  return {
    success: true,
    data: { status: value.status, ...base.data },
  } as const;
}

export function validateHandoffFailInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["failure_code", "internal_note"])
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  const failureCode = optionalText(
    value.failure_code,
    PARTNER_HANDOFF_FAILURE_CODE_MAX_LENGTH
  );
  const note = optionalText(value.internal_note, PARTNER_HANDOFF_NOTE_MAX_LENGTH);
  if (failureCode === undefined || note === undefined) {
    return { success: false, error: "Invalid request." } as const;
  }
  return { success: true, data: { failureCode, note } } as const;
}

export function validateNoteOnlyInput(value: unknown, maxLength: number) {
  if (!isPlainObject(value) || !onlyHasKeys(value, ["internal_note"])) {
    return { success: false, error: "Invalid request." } as const;
  }
  const note = optionalText(value.internal_note, maxLength);
  return note === undefined
    ? ({ success: false, error: "Invalid request." } as const)
    : ({ success: true, data: { note } } as const);
}

export function validateCreateConversionInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, [
      "handoff_id",
      "attribution_reference",
      "external_conversion_reference",
      "internal_note",
    ]) ||
    !isAdminUuid(value.handoff_id)
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  const attributionReference = optionalText(
    value.attribution_reference,
    AFFILIATE_ATTRIBUTION_REFERENCE_MAX_LENGTH
  );
  const externalReference = optionalText(
    value.external_conversion_reference,
    AFFILIATE_EXTERNAL_CONVERSION_REFERENCE_MAX_LENGTH
  );
  const note = optionalText(value.internal_note, AFFILIATE_CONVERSION_NOTE_MAX_LENGTH);
  if (
    attributionReference === undefined ||
    externalReference === undefined ||
    note === undefined
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  return {
    success: true,
    data: {
      handoffId: value.handoff_id,
      attributionReference,
      externalReference,
      note,
    },
  } as const;
}

export function validateConversionStatusInput(value: unknown) {
  const allowedTargets: readonly AffiliateConversionStatus[] = [
    "confirmed",
    "rejected",
    "reversed",
  ];
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["status", "external_conversion_reference", "internal_note"]) ||
    !isOneOf(value.status, allowedTargets) ||
    !AFFILIATE_CONVERSION_STATUSES.includes(value.status)
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  const externalReference = optionalText(
    value.external_conversion_reference,
    AFFILIATE_EXTERNAL_CONVERSION_REFERENCE_MAX_LENGTH
  );
  const note = optionalText(value.internal_note, AFFILIATE_CONVERSION_NOTE_MAX_LENGTH);
  if (externalReference === undefined || note === undefined) {
    return { success: false, error: "Invalid request." } as const;
  }
  return {
    success: true,
    data: { status: value.status, externalReference, note },
  } as const;
}

export function validateCommissionInput(value: unknown) {
  const allowedTargets: readonly AffiliateCommissionStatus[] = [
    "pending",
    "approved",
    "paid",
    "rejected",
    "reversed",
  ];
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["status", "amount", "currency", "internal_note"]) ||
    !isOneOf(value.status, allowedTargets) ||
    !AFFILIATE_COMMISSION_STATUSES.includes(value.status)
  ) {
    return { success: false, error: "Invalid request." } as const;
  }

  const amount = optionalText(value.amount, 13);
  const currency = optionalText(value.currency, 3);
  const note = optionalText(value.internal_note, AFFILIATE_CONVERSION_NOTE_MAX_LENGTH);
  if (
    amount === undefined ||
    currency === undefined ||
    note === undefined ||
    (amount === null) !== (currency === null) ||
    (amount !== null && !MONEY_PATTERN.test(amount)) ||
    (currency !== null && !CURRENCY_PATTERN.test(currency)) ||
    (["approved", "paid"].includes(value.status) &&
      (amount === null || currency === null))
  ) {
    return { success: false, error: "Invalid request." } as const;
  }

  return {
    success: true,
    data: {
      status: value.status,
      amount,
      currency,
      note,
    },
  } as const;
}

export function canTransitionHandoff(
  current: PartnerHandoffStatus,
  action: "send" | "accept" | "reject" | "fail" | "cancel"
) {
  if (current === "pending") {
    return ["send", "fail", "cancel"].includes(action);
  }
  if (current === "sent") {
    return ["accept", "reject", "fail"].includes(action);
  }
  return false;
}

export function canTransitionConversion(
  current: AffiliateConversionStatus,
  target: AffiliateConversionStatus
) {
  return (
    (current === "pending" && ["confirmed", "rejected"].includes(target)) ||
    (current === "confirmed" && target === "reversed")
  );
}

export function canTransitionCommission(
  current: AffiliateCommissionStatus,
  target: AffiliateCommissionStatus
) {
  if (current === "not_reported") {
    return ["pending", "approved", "rejected"].includes(target);
  }
  if (current === "pending") {
    return ["approved", "rejected"].includes(target);
  }
  if (current === "approved") {
    return ["paid", "reversed"].includes(target);
  }
  return current === "paid" && target === "reversed";
}

export function isKnownHandoffStatus(value: unknown): value is PartnerHandoffStatus {
  return isOneOf(value, PARTNER_HANDOFF_STATUSES);
}
