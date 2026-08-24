import type {
  AffiliateCommissionStatus,
  AffiliateConversionStatus,
} from "./affiliate-conversion-types";
import type { LeadStatus } from "./lead-status-types";
import type { PartnerHandoffMethod } from "./partner-types";

type RpcResult = PromiseLike<{ data: unknown; error: unknown }>;
export type AdminRpcClient = {
  rpc(functionName: string, args: Record<string, unknown>): RpcResult;
};

async function invoke(
  client: AdminRpcClient,
  functionName: string,
  args: Record<string, unknown>
) {
  const { data, error } = await client.rpc(functionName, args);
  if (error) {
    throw new Error("Trusted database operation failed.");
  }
  return data;
}

export function changeAdminLeadStatus(
  client: AdminRpcClient,
  input: { leadId: string; status: LeadStatus; note: string | null },
  adminUserId: string
) {
  return invoke(client, "change_lead_status", {
    p_lead_id: input.leadId,
    p_new_status: input.status,
    p_change_source: "admin",
    p_actor_reference: adminUserId,
    p_note: input.note,
  });
}

export function createAdminHandoff(
  client: AdminRpcClient,
  input: {
    leadId: string;
    partnerId: string;
    handoffMethod: PartnerHandoffMethod | null;
    note: string | null;
  }
) {
  return invoke(client, "create_lead_partner_handoff", {
    p_lead_id: input.leadId,
    p_partner_id: input.partnerId,
    p_handoff_method: input.handoffMethod,
    p_internal_note: input.note,
  });
}

export function markAdminHandoffSent(
  client: AdminRpcClient,
  input: {
    handoffId: string;
    externalReference: string | null;
    note: string | null;
  }
) {
  return invoke(client, "mark_lead_handoff_sent", {
    p_handoff_id: input.handoffId,
    p_external_reference: input.externalReference,
    p_internal_note: input.note,
  });
}

export function recordAdminHandoffResponse(
  client: AdminRpcClient,
  input: {
    handoffId: string;
    status: "accepted" | "rejected";
    externalReference: string | null;
    note: string | null;
  }
) {
  return invoke(client, "record_lead_handoff_response", {
    p_handoff_id: input.handoffId,
    p_status: input.status,
    p_external_reference: input.externalReference,
    p_internal_note: input.note,
  });
}

export function markAdminHandoffFailed(
  client: AdminRpcClient,
  input: {
    handoffId: string;
    failureCode: string | null;
    note: string | null;
  }
) {
  return invoke(client, "mark_lead_handoff_failed", {
    p_handoff_id: input.handoffId,
    p_failure_code: input.failureCode,
    p_internal_note: input.note,
  });
}

export function cancelAdminHandoff(
  client: AdminRpcClient,
  input: { handoffId: string; note: string | null }
) {
  return invoke(client, "cancel_lead_handoff", {
    p_handoff_id: input.handoffId,
    p_internal_note: input.note,
  });
}

export function createAdminConversion(
  client: AdminRpcClient,
  input: {
    handoffId: string;
    attributionReference: string | null;
    externalReference: string | null;
    note: string | null;
  }
) {
  return invoke(client, "create_affiliate_conversion", {
    p_handoff_id: input.handoffId,
    p_attribution_reference: input.attributionReference,
    p_external_conversion_reference: input.externalReference,
    p_internal_note: input.note,
  });
}

export function updateAdminConversionStatus(
  client: AdminRpcClient,
  input: {
    conversionId: string;
    status: AffiliateConversionStatus;
    externalReference: string | null;
    note: string | null;
  }
) {
  return invoke(client, "update_affiliate_conversion_status", {
    p_conversion_id: input.conversionId,
    p_status: input.status,
    p_external_conversion_reference: input.externalReference,
    p_internal_note: input.note,
  });
}

export function updateAdminCommission(
  client: AdminRpcClient,
  input: {
    conversionId: string;
    status: AffiliateCommissionStatus;
    amount: string | null;
    currency: string | null;
    note: string | null;
  }
) {
  return invoke(client, "update_affiliate_commission", {
    p_conversion_id: input.conversionId,
    p_commission_status: input.status,
    p_commission_amount: input.amount,
    p_commission_currency: input.currency,
    p_internal_note: input.note,
  });
}

export type PolicyDocumentDependencies = {
  findPolicyPath(leadId: string): Promise<
    | { found: false }
    | { found: true; path: string | null }
  >;
  createSignedUrl(path: string): Promise<string | null>;
};

export async function resolveAdminPolicyDocument(
  leadId: string,
  dependencies: PolicyDocumentDependencies
): Promise<
  | { status: "not_found" }
  | { status: "available"; signedUrl: string }
> {
  const lead = await dependencies.findPolicyPath(leadId);
  if (!lead.found || !lead.path) return { status: "not_found" };

  const signedUrl = await dependencies.createSignedUrl(lead.path);
  if (!signedUrl) throw new Error("Policy signing failed.");
  return { status: "available", signedUrl };
}
