import { adminJsonResponse, authorizeAdminOperation, readAdminJsonBody } from "../../../../../lib/admin-api-request";
import { comparisonApiFailure } from "../../../../../lib/comparison-api";
import { loadAdminComparisonDetail } from "../../../../../lib/comparison-admin-data";
import { createAdminComparisonShare } from "../../../../../lib/comparison-share";
import { COMPARISON_SHARE_BODY_BYTES, isComparisonUuid, validateComparisonShareInput } from "../../../../../lib/comparison-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isComparisonUuid(id)) return adminJsonResponse({ success: false, error: "Invalid comparison data." }, 400);
  const body = await readAdminJsonBody(request, COMPARISON_SHARE_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateComparisonShareInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  const loaded = await loadAdminComparisonDetail(id);
  if (!loaded.available) return comparisonApiFailure(null, "share_load");
  if (!loaded.detail) return adminJsonResponse({ success: false, error: "Comparison not found." }, 404);
  try {
    const share = await createAdminComparisonShare(createPrivilegedSupabaseClient(), loaded.detail.comparison, loaded.detail.options, validation.data.expiryDays, authorization.admin.userId);
    return adminJsonResponse({ success: true, shareId: share.shareId, shareUrl: `/compare/${share.rawToken}`, expiresAt: share.expiresAt }, 201);
  } catch (error) {
    return comparisonApiFailure(error, "share_create");
  }
}
