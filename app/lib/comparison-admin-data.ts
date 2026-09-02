import "server-only";

import { COMPARISON_PAGE_SIZE } from "./comparison-validation";
import type {
  ComparisonHandoffChoice,
  ComparisonPartnerChoice,
  PolicyComparison,
  PolicyComparisonOption,
  PolicyComparisonShare,
} from "./comparison-types";
import type { PartnerInsuranceType } from "./partner-types";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";

export type ComparisonLeadChoice = {
  id: string;
  created_at: string;
  insurance_type: PartnerInsuranceType;
  status: string;
  policy_document_path?: string | null;
};

function unavailable(code: string) {
  console.error("Comparison data unavailable.", { code });
}

export async function loadAdminComparisonList(filters: {
  status: string | null;
  insuranceType: string | null;
  search: string | null;
  page: number;
}) {
  const client = createPrivilegedSupabaseClient();
  const from = (filters.page - 1) * COMPARISON_PAGE_SIZE;
  let query = client.from("policy_comparisons").select(
    "id, created_at, updated_at, created_by, updated_by, lead_id, insurance_type, status, title, customer_intro, internal_note, version, ready_at, archived_at, options:policy_comparison_options(id, option_type, status), shares:policy_comparison_shares(id, expires_at, revoked_at)",
    { count: "exact" }
  );
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.insuranceType) {
    query = query.eq("insurance_type", filters.insuranceType);
  }
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, count, error } = await query
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + COMPARISON_PAGE_SIZE - 1);
  if (error) {
    unavailable("comparison_list_query_failed");
    return { available: false as const, items: [], total: 0, totalPages: 1 };
  }
  const total = count ?? 0;
  return {
    available: true as const,
    items: data ?? [],
    total,
    totalPages: Math.max(1, Math.ceil(total / COMPARISON_PAGE_SIZE)),
  };
}

export async function loadAdminComparisonLeadChoices() {
  const client = createPrivilegedSupabaseClient();
  const { data, error } = await client
    .from("leads")
    .select("id, created_at, insurance_type, status, policy_document_path")
    .in("insurance_type", ["travel", "motor", "property", "health"])
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    unavailable("comparison_lead_choices_failed");
    return [];
  }
  return (data ?? []) as ComparisonLeadChoice[];
}

export async function loadAdminComparisonDetail(comparisonId: string) {
  const client = createPrivilegedSupabaseClient();
  const comparisonResult = await client
    .from("policy_comparisons")
    .select(
      "id, created_at, updated_at, created_by, updated_by, lead_id, insurance_type, status, title, customer_intro, internal_note, version, ready_at, archived_at, lead:leads(id, created_at, insurance_type, status, policy_document_path)"
    )
    .eq("id", comparisonId)
    .maybeSingle();
  if (comparisonResult.error) {
    unavailable("comparison_detail_query_failed");
    return { available: false as const, detail: null };
  }
  if (!comparisonResult.data) {
    return { available: true as const, detail: null };
  }

  const comparison = comparisonResult.data as unknown as PolicyComparison & {
    lead: ComparisonLeadChoice | ComparisonLeadChoice[] | null;
  };
  const optionsRequest = client
    .from("policy_comparison_options")
    .select("*")
    .eq("comparison_id", comparisonId)
    .order("status", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const sharesRequest = client
    .from("policy_comparison_shares")
    .select("id, comparison_id, created_at, expires_at, revoked_at, source_version")
    .eq("comparison_id", comparisonId)
    .order("created_at", { ascending: false })
    .limit(100);
  const partnersRequest = client
    .from("partners")
    .select("id, name, capabilities:partner_capabilities!inner(insurance_type, status)")
    .eq("status", "active")
    .eq("capabilities.insurance_type", comparison.insurance_type)
    .eq("capabilities.status", "active")
    .order("name", { ascending: true })
    .limit(300);
  const handoffsRequest = client
    .from("lead_partner_handoffs")
    .select("id, partner_id, status")
    .eq("lead_id", comparison.lead_id)
    .order("created_at", { ascending: false })
    .limit(300);

  const [optionsResult, sharesResult, partnersResult, handoffsResult] =
    await Promise.all([
      optionsRequest,
      sharesRequest,
      partnersRequest,
      handoffsRequest,
    ]);
  if (
    optionsResult.error ||
    sharesResult.error ||
    partnersResult.error ||
    handoffsResult.error
  ) {
    unavailable("comparison_related_data_failed");
    return { available: false as const, detail: null };
  }

  return {
    available: true as const,
    detail: {
      comparison,
      options: (optionsResult.data ?? []) as PolicyComparisonOption[],
      shares: (sharesResult.data ?? []) as PolicyComparisonShare[],
      partners: (partnersResult.data ?? []) as unknown as ComparisonPartnerChoice[],
      handoffs: (handoffsResult.data ?? []) as ComparisonHandoffChoice[],
    },
  };
}
