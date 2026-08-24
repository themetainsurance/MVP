import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../../../../lib/admin-api-request";
import { ADMIN_STATUS_BODY_BYTES, isAdminUuid, validateCapabilityStatusInput } from "../../../../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; capabilityId: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id, capabilityId } = await context.params;
  if (!isAdminUuid(id) || !isAdminUuid(capabilityId)) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  const body = await readAdminJsonBody(request, ADMIN_STATUS_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateCapabilityStatusInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("partner_capabilities")
      .update({ status: validation.data.status })
      .eq("id", capabilityId)
      .eq("partner_id", id)
      .select("id")
      .maybeSingle();
    if (error) return adminOperationFailed("admin_capability_update_failed");
    if (!data) return adminJsonResponse({ success: false, error: "Record not found." }, 404);
    return adminJsonResponse({ success: true });
  } catch {
    return adminServiceUnavailable("admin_capability_update_unavailable");
  }
}
