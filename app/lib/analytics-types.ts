import type { PartnerInsuranceType } from "./partner-types";

export const ANALYTICS_EVENT_TYPES = ["page_view", "form_started"] as const;
export const ANALYTICS_FORM_MODES = [
  "manual",
  "upload",
  "ai_assistant",
  "unknown",
] as const;
export const ANALYTICS_DATE_RANGES = [7, 30, 90] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];
export type AnalyticsFormMode = (typeof ANALYTICS_FORM_MODES)[number];
export type AnalyticsDateRange = (typeof ANALYTICS_DATE_RANGES)[number];
export type AnalyticsInsuranceType = PartnerInsuranceType;

export type AnalyticsAttribution = {
  landing_path: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
};

export type ValidatedAnalyticsEvent = {
  session_id: string;
  event_id: string;
  event_type: AnalyticsEventType;
  page_path: string | null;
  insurance_type: AnalyticsInsuranceType | null;
  form_mode: AnalyticsFormMode | null;
  attribution: AnalyticsAttribution;
};

export type TrackFormStartedInput = {
  insuranceType: AnalyticsInsuranceType | null;
  formMode: AnalyticsFormMode;
};

export type AnalyticsRpcArguments = {
  p_session_id: string;
  p_client_event_id: string;
  p_event_type: AnalyticsEventType;
  p_page_path: string | null;
  p_insurance_type: AnalyticsInsuranceType | null;
  p_form_mode: AnalyticsFormMode | null;
  p_landing_path: string;
  p_referrer_host: string | null;
  p_utm_source: string | null;
  p_utm_medium: string | null;
  p_utm_campaign: string | null;
  p_utm_term: string | null;
  p_utm_content: string | null;
};

export function toAnalyticsRpcArguments(
  event: ValidatedAnalyticsEvent
): AnalyticsRpcArguments {
  return {
    p_session_id: event.session_id,
    p_client_event_id: event.event_id,
    p_event_type: event.event_type,
    p_page_path: event.page_path,
    p_insurance_type: event.insurance_type,
    p_form_mode: event.form_mode,
    p_landing_path: event.attribution.landing_path,
    p_referrer_host: event.attribution.referrer_host,
    p_utm_source: event.attribution.utm_source,
    p_utm_medium: event.attribution.utm_medium,
    p_utm_campaign: event.attribution.utm_campaign,
    p_utm_term: event.attribution.utm_term,
    p_utm_content: event.attribution.utm_content,
  };
}

export function isDoNotTrackEnabled(value: string | null | undefined) {
  return value === "1";
}

export function formatAnalyticsRate(numerator: number, denominator: number) {
  if (denominator <= 0) return "N/A";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

export function normalizeAnalyticsRange(
  value: string | string[] | undefined
): AnalyticsDateRange {
  const first = Array.isArray(value) ? value[0] : value;
  const parsed = Number(first);
  return ANALYTICS_DATE_RANGES.includes(parsed as AnalyticsDateRange)
    ? (parsed as AnalyticsDateRange)
    : 30;
}
