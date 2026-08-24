import type { AdminRpcClient } from "./admin-dashboard-actions";
import type {
  ComparisonOptionType,
  ComparisonStatus,
  InsuranceComparisonFacts,
} from "./comparison-types";

async function invokeComparisonRpc(
  client: AdminRpcClient,
  name: string,
  args: Record<string, unknown>
) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error("Trusted comparison operation failed.");
  return data;
}

export function createAdminComparison(
  client: AdminRpcClient,
  input: { leadId: string; title: string; internalNote: string | null },
  actorId: string
) {
  return invokeComparisonRpc(client, "create_policy_comparison", {
    p_lead_id: input.leadId,
    p_title: input.title,
    p_internal_note: input.internalNote,
    p_actor_id: actorId,
  });
}

export function updateAdminComparison(
  client: AdminRpcClient,
  comparisonId: string,
  input: {
    title: string;
    customerIntro: string | null;
    internalNote: string | null;
  },
  actorId: string
) {
  return invokeComparisonRpc(client, "update_policy_comparison", {
    p_comparison_id: comparisonId,
    p_title: input.title,
    p_customer_intro: input.customerIntro,
    p_internal_note: input.internalNote,
    p_actor_id: actorId,
  });
}

type OptionFields = {
  providerName: string;
  productName: string | null;
  internalReference: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  facts: InsuranceComparisonFacts;
  customerNote: string | null;
  internalNote: string | null;
  sortOrder: number;
};

function optionRpcFields(input: OptionFields) {
  return {
    p_provider_name: input.providerName,
    p_product_name: input.productName,
    p_internal_reference: input.internalReference,
    p_effective_from: input.effectiveFrom,
    p_effective_to: input.effectiveTo,
    p_facts: input.facts,
    p_customer_note: input.customerNote,
    p_internal_note: input.internalNote,
    p_sort_order: input.sortOrder,
  };
}

export function createAdminComparisonOption(
  client: AdminRpcClient,
  comparisonId: string,
  input: OptionFields & {
    optionType: ComparisonOptionType;
    partnerId: string | null;
    handoffId: string | null;
  },
  actorId: string
) {
  return invokeComparisonRpc(client, "create_policy_comparison_option", {
    p_comparison_id: comparisonId,
    p_option_type: input.optionType,
    p_partner_id: input.partnerId,
    p_handoff_id: input.handoffId,
    ...optionRpcFields(input),
    p_actor_id: actorId,
  });
}

export function updateAdminComparisonOption(
  client: AdminRpcClient,
  comparisonId: string,
  optionId: string,
  input: OptionFields,
  actorId: string
) {
  return invokeComparisonRpc(client, "update_policy_comparison_option", {
    p_comparison_id: comparisonId,
    p_option_id: optionId,
    ...optionRpcFields(input),
    p_actor_id: actorId,
  });
}

export function removeAdminComparisonOption(
  client: AdminRpcClient,
  comparisonId: string,
  optionId: string,
  actorId: string
) {
  return invokeComparisonRpc(client, "remove_policy_comparison_option", {
    p_comparison_id: comparisonId,
    p_option_id: optionId,
    p_actor_id: actorId,
  });
}

export function changeAdminComparisonStatus(
  client: AdminRpcClient,
  comparisonId: string,
  status: ComparisonStatus,
  actorId: string
) {
  return invokeComparisonRpc(client, "change_policy_comparison_status", {
    p_comparison_id: comparisonId,
    p_status: status,
    p_actor_id: actorId,
  });
}

export function revokeAdminComparisonShare(
  client: AdminRpcClient,
  comparisonId: string,
  shareId: string,
  actorId: string
) {
  return invokeComparisonRpc(client, "revoke_policy_comparison_share", {
    p_comparison_id: comparisonId,
    p_share_id: shareId,
    p_actor_id: actorId,
  });
}
