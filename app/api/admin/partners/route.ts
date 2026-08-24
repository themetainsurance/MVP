import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../lib/admin-api-request";
import { ADMIN_PARTNER_BODY_BYTES, validatePartnerInput } from "../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const body = await readAdminJsonBody(request, ADMIN_PARTNER_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validatePartnerInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("partners")
      .insert(validation.data)
      .select("id")
      .single();
    if (error || !data) return adminOperationFailed("admin_partner_create_failed");
    return adminJsonResponse({ success: true, partnerId: data.id }, 201);
  } catch {
    return adminServiceUnavailable("admin_partner_create_unavailable");
  }
}
