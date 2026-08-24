import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../../../lib/admin-api-request";
import { ADMIN_STATUS_BODY_BYTES, isAdminUuid } from "../../../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isAdminUuid(id)) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  const body = await readAdminJsonBody(request, ADMIN_STATUS_BODY_BYTES);
  if (body.success === false) return body.response;
  if (Object.keys(body.data).length) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  try {
    const { data, error } = await createPrivilegedSupabaseClient().rpc("revoke_partner_referral_link", { p_link_id: id });
    if (error || data !== true) return adminOperationFailed("partner_referral_link_revoke_failed");
    return adminJsonResponse({ success: true });
  } catch {
    return adminServiceUnavailable("partner_referral_link_revoke_unavailable");
  }
}
