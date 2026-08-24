import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../../../lib/admin-api-request";
import { isAdminUuid } from "../../../../../lib/admin-dashboard-validation";
import { REFERRAL_ADMIN_BODY_BYTES, validateReferralDestinationInput } from "../../../../../lib/partner-referral-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isAdminUuid(id)) return adminJsonResponse({ success: false, error: "Invalid request." }, 400);
  const body = await readAdminJsonBody(request, REFERRAL_ADMIN_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateReferralDestinationInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const { data, error } = await createPrivilegedSupabaseClient().rpc("create_partner_referral_destination", {
      p_partner_id: id,
      p_insurance_type: validation.data.insurance_type,
      p_country_code: validation.data.country_code,
      p_destination_url: validation.data.destination_url,
      p_customer_link_label: validation.data.customer_link_label,
      p_tracking_parameter_name: validation.data.tracking_parameter_name,
      p_external_campaign_reference: validation.data.external_campaign_reference,
      p_internal_note: validation.data.internal_note,
      p_actor_id: authorization.admin.userId,
    });
    if (error || !data) return adminOperationFailed("partner_referral_destination_create_failed");
    return adminJsonResponse({ success: true, destinationId: data }, 201);
  } catch {
    return adminServiceUnavailable("partner_referral_destination_create_unavailable");
  }
}
