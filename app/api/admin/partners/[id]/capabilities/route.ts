import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../../../lib/admin-api-request";
import { ADMIN_OPERATION_BODY_BYTES, isAdminUuid, validateCapabilityInput } from "../../../../../lib/admin-dashboard-validation";
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
  const validation = validateCapabilityInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("partner_capabilities")
      .insert({ partner_id: id, ...validation.data })
      .select("id")
      .single();
    if (error || !data) return adminOperationFailed("admin_capability_create_failed");
    return adminJsonResponse({ success: true, capabilityId: data.id }, 201);
  } catch {
    return adminServiceUnavailable("admin_capability_create_unavailable");
  }
}
