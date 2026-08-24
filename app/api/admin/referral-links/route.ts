import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../lib/admin-api-request";
import { createServerReferralLink } from "../../../lib/partner-referral-admin";
import { REFERRAL_ADMIN_BODY_BYTES, validateReferralLinkInput } from "../../../lib/partner-referral-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const body = await readAdminJsonBody(request, REFERRAL_ADMIN_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateReferralLinkInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const link = await createServerReferralLink({
      destinationId: validation.data.destination_id,
      expiryDays: validation.data.expiry_days,
      leadId: validation.data.lead_id,
      handoffId: validation.data.handoff_id,
      comparisonId: validation.data.comparison_id,
      comparisonShareId: validation.data.comparison_share_id,
      actorId: authorization.admin.userId,
    });
    return adminJsonResponse({ success: true, linkId: link.linkId, referralUrl: link.path }, 201);
  } catch {
    return adminOperationFailed("partner_referral_link_create_failed");
  }
}
