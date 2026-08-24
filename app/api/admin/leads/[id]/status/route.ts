import {
  adminJsonResponse,
  adminOperationFailed,
  adminServiceUnavailable,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../../../lib/admin-api-request";
import { changeAdminLeadStatus } from "../../../../../lib/admin-dashboard-actions";
import {
  ADMIN_STATUS_BODY_BYTES,
  isAdminUuid,
  validateLeadStatusInput,
} from "../../../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isAdminUuid(id)) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  const body = await readAdminJsonBody(request, ADMIN_STATUS_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateLeadStatusInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);

  try {
    const changed = await changeAdminLeadStatus(
      createPrivilegedSupabaseClient(),
      { leadId: id, status: validation.data.status, note: validation.data.note },
      authorization.admin.userId
    );
    return adminJsonResponse({ success: true, changed: changed === true });
  } catch (error) {
    if (error instanceof Error && error.message === "Trusted database operation failed.") {
      return adminOperationFailed("admin_lead_status_update_failed");
    }
    return adminServiceUnavailable("admin_lead_status_update_unavailable");
  }
}
