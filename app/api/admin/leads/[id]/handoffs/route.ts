import {
  adminJsonResponse,
  adminOperationFailed,
  adminServiceUnavailable,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../../../lib/admin-api-request";
import { createAdminHandoff } from "../../../../../lib/admin-dashboard-actions";
import {
  ADMIN_OPERATION_BODY_BYTES,
  isAdminUuid,
  validateCreateHandoffInput,
} from "../../../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isAdminUuid(id)) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  const body = await readAdminJsonBody(request, ADMIN_OPERATION_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateCreateHandoffInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);

  try {
    const handoffId = await createAdminHandoff(createPrivilegedSupabaseClient(), {
      leadId: id,
      partnerId: validation.data.partnerId,
      handoffMethod: validation.data.handoffMethod,
      note: validation.data.note,
    });
    return adminJsonResponse({ success: true, handoffId });
  } catch (error) {
    if (error instanceof Error && error.message === "Trusted database operation failed.") {
      return adminOperationFailed("admin_handoff_create_failed");
    }
    return adminServiceUnavailable("admin_handoff_create_unavailable");
  }
}
