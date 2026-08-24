import "server-only";

import type { ValidatedAnalyticsEvent } from "./analytics-types";
import { toAnalyticsRpcArguments } from "./analytics-types";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";

export async function storeAnalyticsEvent(
  event: ValidatedAnalyticsEvent
): Promise<boolean> {
  const client = createPrivilegedSupabaseClient();
  const { error } = await client.rpc(
    "record_first_party_analytics_event",
    toAnalyticsRpcArguments(event)
  );
  return !error;
}

export async function snapshotLeadAttribution(
  leadId: string,
  analyticsSessionId: string
): Promise<boolean> {
  const client = createPrivilegedSupabaseClient();
  const { data, error } = await client.rpc("snapshot_lead_attribution", {
    p_lead_id: leadId,
    p_session_id: analyticsSessionId,
  });
  if (error) throw new Error("Lead attribution storage is unavailable.");
  return data === true;
}
