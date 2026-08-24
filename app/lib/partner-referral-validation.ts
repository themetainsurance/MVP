import { PARTNER_INSURANCE_TYPES, type PartnerInsuranceType } from "./partner-types";
import {
  REFERRAL_DESTINATION_STATUSES,
  REFERRAL_LINK_EXPIRY_DAYS,
  type ReferralDestinationStatus,
  type ReferralLinkExpiryDays,
} from "./partner-referral-types";
import { isValidReferralToken } from "./partner-referral-token-core";

export const REFERRAL_ADMIN_BODY_BYTES = 24 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COUNTRY_PATTERN = /^[A-Z]{2,3}$/;
const TRACKING_PATTERN = /^[A-Za-z0-9_-]{1,50}$/;
const CONTROL_PATTERN = /[\u0000-\u001f\u007f]/;
const TEMPLATE_PATTERN = /\{\{|\}\}|\$\{|<%|%>/;
const SECRET_PATTERN = /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\bBearer\s+[A-Za-z0-9._~-]+|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|\b(?:api[_ -]?key|password|secret|access[_ -]?token|refresh[_ -]?token|credential)\s*[:=])/i;
const CREDENTIAL_PARAMETERS = new Set([
  "api_key", "apikey", "secret", "password", "token", "access_token",
  "authorization", "client_secret",
]);
const NON_NEUTRAL_LABEL = /\b(?:buy\s+best|recommended|best\s+offer|winner|best\s+value|choose\s+this\s+policy)\b/i;

type Result<T> = { success: true; data: T } | { success: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function onlyHasKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function optionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength || CONTROL_PATTERN.test(normalized)) return undefined;
  return normalized;
}

function isBlockedIpv4(hostname: string) {
  const parts = hostname.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return false;
  const octets = parts.map(Number);
  if (octets.some((value) => value > 255)) return true;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19));
}

function isBlockedIpv6(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "::" || host === "::1" || host.startsWith("fc") ||
    host.startsWith("fd") || /^fe[89ab]/.test(host) ||
    host.startsWith("::ffff:127.") || host.startsWith("::ffff:10.") ||
    host.startsWith("::ffff:192.168.");
}

export function validateReferralDestinationUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > 2000 || CONTROL_PATTERN.test(normalized) ||
      TEMPLATE_PATTERN.test(normalized) || SECRET_PATTERN.test(normalized)) return null;
  try {
    const url = new URL(normalized);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.protocol !== "https:" || url.username || url.password || url.hash ||
        !hostname || hostname === "localhost" || hostname.endsWith(".localhost") ||
        hostname.endsWith(".local") || hostname.endsWith(".internal") ||
        isBlockedIpv4(hostname) || hostname.includes(":") && isBlockedIpv6(hostname)) return null;
    for (const key of url.searchParams.keys()) {
      if (CREDENTIAL_PARAMETERS.has(key.toLowerCase())) return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export type ReferralDestinationInput = {
  insurance_type: PartnerInsuranceType;
  country_code: string | null;
  destination_url: string;
  customer_link_label: string;
  tracking_parameter_name: string | null;
  external_campaign_reference: string | null;
  internal_note: string | null;
};

export function validateReferralDestinationInput(value: unknown): Result<ReferralDestinationInput> {
  const keys = ["insurance_type", "country_code", "destination_url", "customer_link_label", "tracking_parameter_name", "external_campaign_reference", "internal_note"];
  if (!isPlainObject(value) || !onlyHasKeys(value, keys)) return { success: false, error: "Referral destination could not be saved." };
  const countryText = optionalText(value.country_code, 3);
  const country = typeof countryText === "string" ? countryText.toUpperCase() : countryText;
  const destinationUrl = validateReferralDestinationUrl(value.destination_url);
  const label = optionalText(value.customer_link_label, 80);
  const tracking = optionalText(value.tracking_parameter_name, 50);
  const campaign = optionalText(value.external_campaign_reference, 200);
  const note = optionalText(value.internal_note, 2000);
  if (!PARTNER_INSURANCE_TYPES.includes(value.insurance_type as PartnerInsuranceType) ||
      country === undefined || (country !== null && !COUNTRY_PATTERN.test(country)) || !destinationUrl || !label ||
      NON_NEUTRAL_LABEL.test(label) || (tracking !== null && (tracking === undefined || !TRACKING_PATTERN.test(tracking))) ||
      campaign === undefined || note === undefined || [campaign, note].some((item) => item && SECRET_PATTERN.test(item))) {
    return { success: false, error: "Referral destination could not be saved." };
  }
  return { success: true, data: {
    insurance_type: value.insurance_type as PartnerInsuranceType,
    country_code: country, destination_url: destinationUrl,
    customer_link_label: label, tracking_parameter_name: tracking,
    external_campaign_reference: campaign, internal_note: note,
  } };
}

export function validateReferralDestinationStatusInput(value: unknown): Result<{ status: "active" | "inactive" }> {
  if (!isPlainObject(value) || !onlyHasKeys(value, ["status"]) || !["active", "inactive"].includes(String(value.status))) {
    return { success: false, error: "Referral destination could not be saved." };
  }
  return { success: true, data: { status: value.status as "active" | "inactive" } };
}

export type ReferralLinkInput = {
  destination_id: string;
  expiry_days: ReferralLinkExpiryDays;
  lead_id: string | null;
  handoff_id: string | null;
  comparison_id: string | null;
  comparison_share_id: string | null;
};

export function validateReferralLinkInput(value: unknown): Result<ReferralLinkInput> {
  const keys = ["destination_id", "expiry_days", "lead_id", "handoff_id", "comparison_id", "comparison_share_id"];
  if (!isPlainObject(value) || !onlyHasKeys(value, keys)) return { success: false, error: "Referral link could not be created." };
  const expiry = typeof value.expiry_days === "string" ? Number(value.expiry_days) : value.expiry_days;
  const nullableUuid = (item: unknown) => item === undefined || item === null || item === "" ? null : typeof item === "string" && UUID_PATTERN.test(item) ? item : undefined;
  const leadId = nullableUuid(value.lead_id);
  const handoffId = nullableUuid(value.handoff_id);
  const comparisonId = nullableUuid(value.comparison_id);
  const comparisonShareId = nullableUuid(value.comparison_share_id);
  if (typeof value.destination_id !== "string" || !UUID_PATTERN.test(value.destination_id) ||
      !REFERRAL_LINK_EXPIRY_DAYS.includes(expiry as ReferralLinkExpiryDays) ||
      [leadId, handoffId, comparisonId, comparisonShareId].includes(undefined)) {
    return { success: false, error: "Referral link could not be created." };
  }
  return { success: true, data: { destination_id: value.destination_id, expiry_days: expiry as ReferralLinkExpiryDays, lead_id: leadId!, handoff_id: handoffId!, comparison_id: comparisonId!, comparison_share_id: comparisonShareId! } };
}

export function isReferralUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function isReferralToken(value: unknown): value is string {
  return isValidReferralToken(value);
}

export function isReferralDestinationStatus(value: unknown): value is ReferralDestinationStatus {
  return typeof value === "string" && REFERRAL_DESTINATION_STATUSES.includes(value as ReferralDestinationStatus);
}
