import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ADMIN_PAGE_SIZE,
  type LeadListFilters,
} from "./admin-dashboard-validation";
import type {
  AdminConversion,
  AdminConversionHistory,
  AdminDashboardSummary,
  AdminHandoff,
  AdminHandoffHistory,
  AdminLead,
  AdminLeadListItem,
  AdminLeadStatusHistory,
  AdminPageResult,
  AdminPartner,
  AdminPartnerCapability,
} from "./admin-dashboard-types";
import type {
  AffiliateCommissionStatus,
  AffiliateConversionStatus,
} from "./affiliate-conversion-types";
import type { LeadStatus } from "./lead-status-types";
import type { PartnerHandoffStatus } from "./partner-handoff-types";
import type {
  PartnerInsuranceType,
  PartnerStatus,
} from "./partner-types";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";

type Filter = { column: string; value: string };

function fail(code: string): never {
  console.error("Admin data query failed.", { code });
  throw new Error("Admin operational data is unavailable.");
}

function pageResult<T>(
  items: T[],
  count: number | null,
  page: number
): AdminPageResult<T> {
  const total = count ?? 0;
  return {
    items,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}

async function exactCount(
  client: SupabaseClient,
  table: string,
  filters: Filter[] = []
) {
  let query = client.from(table).select("id", { count: "exact", head: true });
  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }
  const { count, error } = await query;
  if (error) fail(`admin_${table}_count_failed`);
  return count ?? 0;
}

export async function loadAdminDashboard(): Promise<AdminDashboardSummary> {
  const client = createPrivilegedSupabaseClient();
  const countRequests = [
    exactCount(client, "leads"),
    exactCount(client, "leads", [{ column: "status", value: "new" }]),
    exactCount(client, "leads", [{ column: "status", value: "reviewing" }]),
    exactCount(client, "leads", [
      { column: "status", value: "sent_to_partner" },
    ]),
    exactCount(client, "leads", [{ column: "status", value: "completed" }]),
    exactCount(client, "partners", [{ column: "status", value: "active" }]),
    exactCount(client, "lead_partner_handoffs", [
      { column: "status", value: "pending" },
    ]),
    exactCount(client, "lead_partner_handoffs", [
      { column: "status", value: "sent" },
    ]),
    exactCount(client, "affiliate_conversions", [
      { column: "status", value: "pending" },
    ]),
    exactCount(client, "affiliate_conversions", [
      { column: "status", value: "confirmed" },
    ]),
    exactCount(client, "affiliate_conversions", [
      { column: "commission_status", value: "pending" },
    ]),
    exactCount(client, "affiliate_conversions", [
      { column: "commission_status", value: "approved" },
    ]),
    exactCount(client, "affiliate_conversions", [
      { column: "commission_status", value: "paid" },
    ]),
  ] as const;

  const recentLeadsRequest = client
    .from("leads")
    .select(
      "id, created_at, insurance_type, full_name, email, phone, preferred_contact, status, policy_document_path"
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(6);

  const recentHandoffsRequest = client
    .from("lead_partner_handoffs")
    .select(
      "id, created_at, updated_at, lead_id, partner_id, handoff_method, status, assigned_at, sent_at, responded_at, external_reference, failure_code, internal_note, lead:leads!lead_partner_handoffs_lead_id_fkey(id, insurance_type, full_name), partner:partners!lead_partner_handoffs_partner_id_fkey(id, name, status)"
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(6);

  const recentConversionsRequest = client
    .from("affiliate_conversions")
    .select(
      "id, created_at, updated_at, handoff_id, status, attribution_reference, external_conversion_reference, reported_at, confirmed_at, reversed_at, commission_status, commission_amount, commission_currency, commission_reported_at, commission_paid_at, internal_note, handoff:lead_partner_handoffs!affiliate_conversions_handoff_id_fkey(id, created_at, updated_at, lead_id, partner_id, handoff_method, status, assigned_at, sent_at, responded_at, external_reference, failure_code, internal_note, lead:leads!lead_partner_handoffs_lead_id_fkey(id, insurance_type, full_name), partner:partners!lead_partner_handoffs_partner_id_fkey(id, name, status))"
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(6);

  const [
    counts,
    recentLeadsResult,
    recentHandoffsResult,
    recentConversionsResult,
  ] = await Promise.all([
    Promise.all(countRequests),
    recentLeadsRequest,
    recentHandoffsRequest,
    recentConversionsRequest,
  ]);

  if (recentLeadsResult.error) fail("admin_recent_leads_failed");
  if (recentHandoffsResult.error) fail("admin_recent_handoffs_failed");
  if (recentConversionsResult.error) fail("admin_recent_conversions_failed");

  return {
    totalLeads: counts[0],
    newLeads: counts[1],
    reviewingLeads: counts[2],
    sentToPartnerLeads: counts[3],
    completedLeads: counts[4],
    activePartners: counts[5],
    pendingHandoffs: counts[6],
    sentHandoffs: counts[7],
    pendingConversions: counts[8],
    confirmedConversions: counts[9],
    pendingCommissions: counts[10],
    approvedCommissions: counts[11],
    paidCommissions: counts[12],
    recentLeads: (recentLeadsResult.data ?? []) as AdminLeadListItem[],
    recentHandoffs: (recentHandoffsResult.data ?? []) as unknown as AdminHandoff[],
    recentConversions: (recentConversionsResult.data ?? []) as unknown as AdminConversion[],
  };
}

export async function loadAdminLeads(
  filters: LeadListFilters
): Promise<AdminPageResult<AdminLeadListItem>> {
  const client = createPrivilegedSupabaseClient();
  const from = (filters.page - 1) * ADMIN_PAGE_SIZE;
  let query = client
    .from("leads")
    .select(
      "id, created_at, insurance_type, full_name, email, phone, preferred_contact, status, policy_document_path",
      { count: "exact" }
    );

  if (filters.insuranceType) {
    query = query.eq("insurance_type", filters.insuranceType);
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);

  if (error) fail("admin_leads_list_failed");
  return pageResult((data ?? []) as AdminLeadListItem[], count, filters.page);
}

export async function loadAdminLeadDetail(leadId: string) {
  const client = createPrivilegedSupabaseClient();
  const { data: leadData, error: leadError } = await client
    .from("leads")
    .select(
      "id, created_at, insurance_type, full_name, email, phone, preferred_contact, status, policy_document_path, consent, source, details"
    )
    .eq("id", leadId)
    .maybeSingle();
  if (leadError) fail("admin_lead_detail_failed");
  if (!leadData) return null;
  const lead = leadData as AdminLead;

  const historyRequest = client
    .from("lead_status_history")
    .select(
      "id, created_at, previous_status, new_status, change_source, actor_reference, note"
    )
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(100);

  const handoffsRequest = client
    .from("lead_partner_handoffs")
    .select(
      "id, created_at, updated_at, lead_id, partner_id, handoff_method, status, assigned_at, sent_at, responded_at, external_reference, failure_code, internal_note, partner:partners!lead_partner_handoffs_partner_id_fkey(id, name, status), conversion:affiliate_conversions(id, status, commission_status)"
    )
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(100);

  const partnersRequest = client
    .from("partners")
    .select(
      "id, created_at, updated_at, name, partner_type, status, website_url, contact_email, handoff_method, affiliate_reference, notes, capabilities:partner_capabilities!inner(id, created_at, partner_id, insurance_type, country_code, status)"
    )
    .eq("status", "active")
    .eq("capabilities.insurance_type", lead.insurance_type)
    .eq("capabilities.status", "active")
    .order("name", { ascending: true })
    .limit(200);

  const [historyResult, handoffsResult, partnersResult] = await Promise.all([
    historyRequest,
    handoffsRequest,
    partnersRequest,
  ]);
  if (historyResult.error) fail("admin_lead_history_failed");
  if (handoffsResult.error) fail("admin_lead_handoffs_failed");
  if (partnersResult.error) fail("admin_lead_partners_failed");

  const handoffs = (handoffsResult.data ?? []) as unknown as AdminHandoff[];
  let handoffHistory: AdminHandoffHistory[] = [];
  if (handoffs.length > 0) {
    const { data, error } = await client
      .from("lead_partner_handoff_history")
      .select(
        "id, handoff_id, created_at, previous_status, new_status, change_source, note"
      )
      .in(
        "handoff_id",
        handoffs.map((handoff) => handoff.id)
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(500);
    if (error) fail("admin_handoff_history_failed");
    handoffHistory = (data ?? []) as AdminHandoffHistory[];
  }

  return {
    lead,
    history: (historyResult.data ?? []) as AdminLeadStatusHistory[],
    handoffs,
    handoffHistory,
    eligiblePartners: (partnersResult.data ?? []) as unknown as AdminPartner[],
  };
}

export async function loadAdminPartners(
  page: number,
  status: PartnerStatus | null
): Promise<AdminPageResult<AdminPartner>> {
  const client = createPrivilegedSupabaseClient();
  const from = (page - 1) * ADMIN_PAGE_SIZE;
  let query = client.from("partners").select(
    "id, created_at, updated_at, name, partner_type, status, website_url, contact_email, handoff_method, affiliate_reference, notes, capabilities:partner_capabilities(id, created_at, partner_id, insurance_type, country_code, status)",
    { count: "exact" }
  );
  if (status) query = query.eq("status", status);
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);
  if (error) fail("admin_partners_list_failed");
  return pageResult((data ?? []) as unknown as AdminPartner[], count, page);
}

export async function loadAdminPartnerDetail(partnerId: string) {
  const client = createPrivilegedSupabaseClient();
  const partnerRequest = client
    .from("partners")
    .select(
      "id, created_at, updated_at, name, partner_type, status, website_url, contact_email, handoff_method, affiliate_reference, notes"
    )
    .eq("id", partnerId)
    .maybeSingle();
  const capabilitiesRequest = client
    .from("partner_capabilities")
    .select("id, created_at, partner_id, insurance_type, country_code, status")
    .eq("partner_id", partnerId)
    .order("insurance_type", { ascending: true })
    .order("country_code", { ascending: true });
  const recentHandoffsRequest = client
    .from("lead_partner_handoffs")
    .select(
      "id, created_at, updated_at, lead_id, partner_id, handoff_method, status, assigned_at, sent_at, responded_at, external_reference, failure_code, internal_note, lead:leads!lead_partner_handoffs_lead_id_fkey(id, insurance_type, full_name)"
    )
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false })
    .limit(10);

  const [partnerResult, capabilitiesResult, recentHandoffsResult, total, pending, sent, accepted] =
    await Promise.all([
      partnerRequest,
      capabilitiesRequest,
      recentHandoffsRequest,
      exactCount(client, "lead_partner_handoffs", [
        { column: "partner_id", value: partnerId },
      ]),
      exactCount(client, "lead_partner_handoffs", [
        { column: "partner_id", value: partnerId },
        { column: "status", value: "pending" },
      ]),
      exactCount(client, "lead_partner_handoffs", [
        { column: "partner_id", value: partnerId },
        { column: "status", value: "sent" },
      ]),
      exactCount(client, "lead_partner_handoffs", [
        { column: "partner_id", value: partnerId },
        { column: "status", value: "accepted" },
      ]),
    ]);

  if (partnerResult.error) fail("admin_partner_detail_failed");
  if (!partnerResult.data) return null;
  if (capabilitiesResult.error) fail("admin_partner_capabilities_failed");
  if (recentHandoffsResult.error) fail("admin_partner_handoffs_failed");
  return {
    partner: partnerResult.data as AdminPartner,
    capabilities: (capabilitiesResult.data ?? []) as AdminPartnerCapability[],
    recentHandoffs: (recentHandoffsResult.data ?? []) as unknown as AdminHandoff[],
    stats: { total, pending, sent, accepted },
  };
}

export type HandoffListFilters = {
  page: number;
  status: PartnerHandoffStatus | null;
  partnerId: string | null;
  insuranceType: PartnerInsuranceType | null;
};

export async function loadAdminHandoffs(filters: HandoffListFilters) {
  const client = createPrivilegedSupabaseClient();
  const from = (filters.page - 1) * ADMIN_PAGE_SIZE;
  let query = client.from("lead_partner_handoffs").select(
    "id, created_at, updated_at, lead_id, partner_id, handoff_method, status, assigned_at, sent_at, responded_at, external_reference, failure_code, internal_note, lead:leads!lead_partner_handoffs_lead_id_fkey!inner(id, insurance_type, full_name), partner:partners!lead_partner_handoffs_partner_id_fkey!inner(id, name, status), conversion:affiliate_conversions(id, status, commission_status)",
    { count: "exact" }
  );
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.partnerId) query = query.eq("partner_id", filters.partnerId);
  if (filters.insuranceType) {
    query = query.eq("lead.insurance_type", filters.insuranceType);
  }
  const [listResult, partnersResult] = await Promise.all([
    query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + ADMIN_PAGE_SIZE - 1),
    client
      .from("partners")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(500),
  ]);
  if (listResult.error) fail("admin_handoffs_list_failed");
  if (partnersResult.error) fail("admin_handoff_partners_failed");
  return {
    result: pageResult(
      (listResult.data ?? []) as unknown as AdminHandoff[],
      listResult.count,
      filters.page
    ),
    partners: (partnersResult.data ?? []) as Pick<AdminPartner, "id" | "name">[],
  };
}

export type ConversionListFilters = {
  page: number;
  status: AffiliateConversionStatus | null;
  commissionStatus: AffiliateCommissionStatus | null;
  partnerId: string | null;
  insuranceType: PartnerInsuranceType | null;
};

export async function loadAdminConversions(filters: ConversionListFilters) {
  const client = createPrivilegedSupabaseClient();
  const from = (filters.page - 1) * ADMIN_PAGE_SIZE;
  let query = client.from("affiliate_conversions").select(
    "id, created_at, updated_at, handoff_id, status, attribution_reference, external_conversion_reference, reported_at, confirmed_at, reversed_at, commission_status, commission_amount, commission_currency, commission_reported_at, commission_paid_at, internal_note, handoff:lead_partner_handoffs!affiliate_conversions_handoff_id_fkey!inner(id, created_at, updated_at, lead_id, partner_id, handoff_method, status, assigned_at, sent_at, responded_at, external_reference, failure_code, internal_note, lead:leads!lead_partner_handoffs_lead_id_fkey!inner(id, insurance_type, full_name), partner:partners!lead_partner_handoffs_partner_id_fkey!inner(id, name, status))",
    { count: "exact" }
  );
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.commissionStatus) {
    query = query.eq("commission_status", filters.commissionStatus);
  }
  if (filters.partnerId) {
    query = query.eq("handoff.partner_id", filters.partnerId);
  }
  if (filters.insuranceType) {
    query = query.eq("handoff.lead.insurance_type", filters.insuranceType);
  }
  const [listResult, partnersResult] = await Promise.all([
    query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + ADMIN_PAGE_SIZE - 1),
    client
      .from("partners")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(500),
  ]);
  if (listResult.error) fail("admin_conversions_list_failed");
  if (partnersResult.error) fail("admin_conversion_partners_failed");
  return {
    result: pageResult(
      (listResult.data ?? []) as unknown as AdminConversion[],
      listResult.count,
      filters.page
    ),
    partners: (partnersResult.data ?? []) as Pick<AdminPartner, "id" | "name">[],
  };
}

export async function loadAdminConversionDetail(conversionId: string) {
  const client = createPrivilegedSupabaseClient();
  const [conversionResult, historyResult] = await Promise.all([
    client
      .from("affiliate_conversions")
      .select(
        "id, created_at, updated_at, handoff_id, status, attribution_reference, external_conversion_reference, reported_at, confirmed_at, reversed_at, commission_status, commission_amount, commission_currency, commission_reported_at, commission_paid_at, internal_note, handoff:lead_partner_handoffs!affiliate_conversions_handoff_id_fkey(id, created_at, updated_at, lead_id, partner_id, handoff_method, status, assigned_at, sent_at, responded_at, external_reference, failure_code, internal_note, lead:leads!lead_partner_handoffs_lead_id_fkey(id, insurance_type, full_name), partner:partners!lead_partner_handoffs_partner_id_fkey(id, name, status))"
      )
      .eq("id", conversionId)
      .maybeSingle(),
    client
      .from("affiliate_conversion_history")
      .select(
        "id, conversion_id, created_at, previous_conversion_status, new_conversion_status, previous_commission_status, new_commission_status, change_source, note"
      )
      .eq("conversion_id", conversionId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(200),
  ]);
  if (conversionResult.error) fail("admin_conversion_detail_failed");
  if (!conversionResult.data) return null;
  if (historyResult.error) fail("admin_conversion_history_failed");
  return {
    conversion: conversionResult.data as unknown as AdminConversion,
    history: (historyResult.data ?? []) as AdminConversionHistory[],
  };
}
