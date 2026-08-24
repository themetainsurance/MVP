import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../../../../../lib/admin-api-request";
import { ADMIN_STATUS_BODY_BYTES, isAdminUuid } from "../../../../../../../lib/admin-dashboard-validation";
import { validateReferralDestinationStatusInput } from "../../../../../../../lib/partner-referral-validation";
import { createPrivilegedSupabaseClient } from "../../../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string; destinationId: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id, destinationId } = await context.params;
  if (!isAdminUuid(id) || !isAdminUuid(destinationId)) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  const body = await readAdminJsonBody(request, ADMIN_STATUS_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateReferralDestinationStatusInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const client = createPrivilegedSupabaseClient();
    const existing = await client.from("partner_referral_destinations").select("id").eq("id", destinationId).eq("partner_id", id).maybeSingle();
    if (existing.error) return adminOperationFailed("partner_referral_destination_status_failed");
    if (!existing.data) return adminJsonResponse({ success: false, error: "Record not found." }, 404);
    const { data, error } = await client.rpc("change_partner_referral_destination_status", {
      p_destination_id: destinationId,
      p_status: validation.data.status,
      p_actor_id: authorization.admin.userId,
    });
    if (error || data !== true) return adminOperationFailed("partner_referral_destination_status_failed");
    return adminJsonResponse({ success: true });
  } catch {
    return adminServiceUnavailable("partner_referral_destination_status_unavailable");
  }
}
