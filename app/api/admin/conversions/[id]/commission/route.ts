import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../../../lib/admin-api-request";
import { updateAdminCommission } from "../../../../../lib/admin-dashboard-actions";
import { ADMIN_OPERATION_BODY_BYTES, isAdminUuid, validateCommissionInput } from "../../../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isAdminUuid(id)) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  const body = await readAdminJsonBody(request, ADMIN_OPERATION_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateCommissionInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    await updateAdminCommission(createPrivilegedSupabaseClient(), { conversionId: id, ...validation.data });
    return adminJsonResponse({ success: true });
  } catch (error) {
    return error instanceof Error && error.message === "Trusted database operation failed."
      ? adminOperationFailed("admin_commission_update_failed")
      : adminServiceUnavailable("admin_commission_update_unavailable");
  }
}
