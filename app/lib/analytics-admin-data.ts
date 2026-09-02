import "server-only";

import type { AnalyticsDateRange } from "./analytics-types";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";

export type AdminAnalyticsSummary = {
  sessions: number;
  pageViews: number;
  sessionsWithFormStart: number;
  formStarts: number;
  leads: number;
  handedOffLeads: number;
  confirmedConversionLeads: number;
  paidCommissionLeads: number;
  reversedConversionLeads: number;
  unattributedLeads: number;
  totalHandoffsSent: number;
  totalConfirmedConversions: number;
  totalPaidCommissions: number;
};

export type AdminAnalyticsInsuranceRow = {
  insuranceType: "travel" | "motor" | "property" | "health";
  formStarts: number;
  leads: number;
  handedOffLeads: number;
  confirmedConversionLeads: number;
  paidCommissionLeads: number;
};

export type AdminAnalyticsAttributionRow = {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  formStarts: number;
  leads: number;
  confirmedConversionLeads: number;
  paidCommissionLeads: number;
};

export type AdminAnalyticsLandingRow = {
  path: string;
  sessions: number;
  attributedLeads: number;
};

export type AdminAnalyticsPageRow = {
  path: string;
  pageViews: number;
};

export type AdminAnalyticsCommissionRow = {
  currency: string;
  amount: string;
  paidCommissions: number;
};

export type AdminAnalyticsData = {
  available: boolean;
  range: AnalyticsDateRange;
  startAt: string;
  endAt: string;
  summary: AdminAnalyticsSummary;
  commissions: AdminAnalyticsCommissionRow[];
  insurance: AdminAnalyticsInsuranceRow[];
  attribution: AdminAnalyticsAttributionRow[];
  landingPages: AdminAnalyticsLandingRow[];
  topPages: AdminAnalyticsPageRow[];
};

type Row = Record<string, unknown>;

const emptySummary: AdminAnalyticsSummary = {
  sessions: 0,
  pageViews: 0,
  sessionsWithFormStart: 0,
  formStarts: 0,
  leads: 0,
  handedOffLeads: 0,
  confirmedConversionLeads: 0,
  paidCommissionLeads: 0,
  reversedConversionLeads: 0,
  unattributedLeads: 0,
  totalHandoffsSent: 0,
  totalConfirmedConversions: 0,
  totalPaidCommissions: 0,
};

function count(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value ? value : fallback;
}

function rows(value: unknown): Row[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Row => !!item && typeof item === "object" && !Array.isArray(item)
      )
    : [];
}

function unavailable(
  range: AnalyticsDateRange,
  startAt: string,
  endAt: string
): AdminAnalyticsData {
  return {
    available: false,
    range,
    startAt,
    endAt,
    summary: { ...emptySummary },
    commissions: [],
    insurance: [],
    attribution: [],
    landingPages: [],
    topPages: [],
  };
}

export async function loadAdminAnalytics(
  range: AnalyticsDateRange
): Promise<AdminAnalyticsData> {
  const end = new Date();
  const start = new Date(end.getTime() - range * 24 * 60 * 60 * 1000);
  const startAt = start.toISOString();
  const endAt = end.toISOString();
  const args = { p_start_at: startAt, p_end_at: endAt };

  try {
    const client = createPrivilegedSupabaseClient();
    const [summaryResult, commissionResult, insuranceResult, attributionResult, landingResult, pageResult] =
      await Promise.all([
        client.rpc("get_admin_analytics_summary", args),
        client.rpc("get_admin_analytics_paid_commissions", args),
        client.rpc("get_admin_analytics_insurance_breakdown", args),
        client.rpc("get_admin_analytics_attribution_breakdown", args),
        client.rpc("get_admin_analytics_landing_pages", args),
        client.rpc("get_admin_analytics_top_pages", args),
      ]);

    if (
      summaryResult.error ||
      commissionResult.error ||
      insuranceResult.error ||
      attributionResult.error ||
      landingResult.error ||
      pageResult.error
    ) {
      console.error("Admin analytics query unavailable.", {
        code: "admin_analytics_unavailable",
      });
      return unavailable(range, startAt, endAt);
    }

    const summaryRow = rows(summaryResult.data)[0] ?? {};
    const summary: AdminAnalyticsSummary = {
      sessions: count(summaryRow.sessions),
      pageViews: count(summaryRow.page_views),
      sessionsWithFormStart: count(summaryRow.sessions_with_form_start),
      formStarts: count(summaryRow.form_starts),
      leads: count(summaryRow.leads),
      handedOffLeads: count(summaryRow.handed_off_leads),
      confirmedConversionLeads: count(summaryRow.confirmed_conversion_leads),
      paidCommissionLeads: count(summaryRow.paid_commission_leads),
      reversedConversionLeads: count(summaryRow.reversed_conversion_leads),
      unattributedLeads: count(summaryRow.unattributed_leads),
      totalHandoffsSent: count(summaryRow.total_handoffs_sent),
      totalConfirmedConversions: count(summaryRow.total_confirmed_conversions),
      totalPaidCommissions: count(summaryRow.total_paid_commissions),
    };

    return {
      available: true,
      range,
      startAt,
      endAt,
      summary,
      commissions: rows(commissionResult.data).map((row) => ({
        currency: text(row.currency, "Unknown"),
        amount: text(row.amount, "0"),
        paidCommissions: count(row.paid_commissions),
      })),
      insurance: rows(insuranceResult.data).map((row) => ({
        insuranceType: text(row.insurance_type, "travel") as AdminAnalyticsInsuranceRow["insuranceType"],
        formStarts: count(row.form_starts),
        leads: count(row.leads),
        handedOffLeads: count(row.handed_off_leads),
        confirmedConversionLeads: count(row.confirmed_conversion_leads),
        paidCommissionLeads: count(row.paid_commission_leads),
      })),
      attribution: rows(attributionResult.data).map((row) => ({
        source: text(row.source, "Unattributed"),
        medium: text(row.medium, "(none)"),
        campaign: text(row.campaign, "(none)"),
        sessions: count(row.sessions),
        formStarts: count(row.form_starts),
        leads: count(row.leads),
        confirmedConversionLeads: count(row.confirmed_conversion_leads),
        paidCommissionLeads: count(row.paid_commission_leads),
      })),
      landingPages: rows(landingResult.data).map((row) => ({
        path: text(row.path, "/"),
        sessions: count(row.sessions),
        attributedLeads: count(row.attributed_leads),
      })),
      topPages: rows(pageResult.data).map((row) => ({
        path: text(row.path, "/"),
        pageViews: count(row.page_views),
      })),
    };
  } catch {
    console.error("Admin analytics query unavailable.", {
      code: "admin_analytics_unavailable",
    });
    return unavailable(range, startAt, endAt);
  }
}
