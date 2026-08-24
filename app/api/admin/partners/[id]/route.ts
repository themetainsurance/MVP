import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../../lib/admin-api-request";
import { ADMIN_PARTNER_BODY_BYTES, isAdminUuid, validatePartnerInput } from "../../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isAdminUuid(id)) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  const body = await readAdminJsonBody(request, ADMIN_PARTNER_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validatePartnerInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("partners")
      .update(validation.data)
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return adminOperationFailed("admin_partner_update_failed");
    if (!data) return adminJsonResponse({ success: false, error: "Record not found." }, 404);
    return adminJsonResponse({ success: true });
  } catch {
    return adminServiceUnavailable("admin_partner_update_unavailable");
  }
}
