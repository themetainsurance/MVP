import {
  ANALYTICS_EVENT_TYPES,
  ANALYTICS_FORM_MODES,
  type AnalyticsAttribution,
  type AnalyticsEventType,
  type AnalyticsFormMode,
  type AnalyticsInsuranceType,
  type ValidatedAnalyticsEvent,
} from "./analytics-types";
import { PARTNER_INSURANCE_TYPES } from "./partner-types";

export const ANALYTICS_REQUEST_BODY_BYTES = 8 * 1024;
export const ANALYTICS_PATH_MAX_LENGTH = 300;
export const ANALYTICS_REFERRER_MAX_LENGTH = 253;
export const ANALYTICS_UTM_LIMITS = {
  utm_source: 100,
  utm_medium: 100,
  utm_campaign: 150,
  utm_term: 150,
  utm_content: 150,
} as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/;
const INTERNAL_REFERRERS = new Set([
  "themetainsurance.com",
  "www.themetainsurance.com",
]);

type AnalyticsValidationResult =
  | { success: true; data: ValidatedAnalyticsEvent }
  | { success: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function onlyHasKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function optionalBoundedText(
  value: unknown,
  maxLength: number
): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized) return null;
  if (
    normalized.length > maxLength ||
    CONTROL_CHARACTER_PATTERN.test(normalized)
  ) {
    return undefined;
  }
  return normalized;
}

export function isAnalyticsUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function isAnalyticsPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= ANALYTICS_PATH_MAX_LENGTH &&
    value.startsWith("/") &&
    !value.includes("?") &&
    !value.includes("#") &&
    !CONTROL_CHARACTER_PATTERN.test(value) &&
    !/^\/(?:admin|api|compare|go)(?:\/|$)/.test(value)
  );
}

function validateReferrer(value: unknown): string | null | undefined {
  const normalized = optionalBoundedText(value, ANALYTICS_REFERRER_MAX_LENGTH);
  if (normalized === undefined || normalized === null) return normalized;
  const hostname = normalized.toLowerCase();
  if (!HOSTNAME_PATTERN.test(hostname)) return undefined;
  return INTERNAL_REFERRERS.has(hostname) ? null : hostname;
}

function validateAttribution(value: unknown): AnalyticsAttribution | null {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, [
      "landing_path",
      "referrer_host",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ]) ||
    !isAnalyticsPath(value.landing_path)
  ) {
    return null;
  }

  const referrerHost = validateReferrer(value.referrer_host);
  const utmSource = optionalBoundedText(
    value.utm_source,
    ANALYTICS_UTM_LIMITS.utm_source
  );
  const utmMedium = optionalBoundedText(
    value.utm_medium,
    ANALYTICS_UTM_LIMITS.utm_medium
  );
  const utmCampaign = optionalBoundedText(
    value.utm_campaign,
    ANALYTICS_UTM_LIMITS.utm_campaign
  );
  const utmTerm = optionalBoundedText(
    value.utm_term,
    ANALYTICS_UTM_LIMITS.utm_term
  );
  const utmContent = optionalBoundedText(
    value.utm_content,
    ANALYTICS_UTM_LIMITS.utm_content
  );

  if (
    referrerHost === undefined ||
    utmSource === undefined ||
    utmMedium === undefined ||
    utmCampaign === undefined ||
    utmTerm === undefined ||
    utmContent === undefined
  ) {
    return null;
  }

  return {
    landing_path: value.landing_path,
    referrer_host: referrerHost,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent,
  };
}

export function isAnalyticsRequestBodyTooLarge(rawBody: string) {
  return new TextEncoder().encode(rawBody).byteLength > ANALYTICS_REQUEST_BODY_BYTES;
}

export function validateAnalyticsEvent(
  value: unknown
): AnalyticsValidationResult {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, [
      "session_id",
      "event_id",
      "event_type",
      "page_path",
      "insurance_type",
      "form_mode",
      "attribution",
    ]) ||
    !isAnalyticsUuid(value.session_id) ||
    !isAnalyticsUuid(value.event_id) ||
    !isOneOf(value.event_type, ANALYTICS_EVENT_TYPES)
  ) {
    return { success: false, error: "Invalid analytics event." };
  }

  const pagePath = value.page_path == null ? null : value.page_path;
  const insuranceType =
    value.insurance_type == null ? null : value.insurance_type;
  const formMode = value.form_mode == null ? null : value.form_mode;
  const attribution = validateAttribution(value.attribution);

  if (
    (pagePath !== null && !isAnalyticsPath(pagePath)) ||
    (insuranceType !== null &&
      !isOneOf(insuranceType, PARTNER_INSURANCE_TYPES)) ||
    !attribution ||
    (value.event_type === "page_view" && formMode !== null) ||
    (value.event_type === "form_started" &&
      !isOneOf(formMode, ANALYTICS_FORM_MODES))
  ) {
    return { success: false, error: "Invalid analytics event." };
  }

  return {
    success: true,
    data: {
      session_id: value.session_id,
      event_id: value.event_id,
      event_type: value.event_type as AnalyticsEventType,
      page_path: pagePath as string | null,
      insurance_type: insuranceType as AnalyticsInsuranceType | null,
      form_mode: formMode as AnalyticsFormMode | null,
      attribution,
    },
  };
}
