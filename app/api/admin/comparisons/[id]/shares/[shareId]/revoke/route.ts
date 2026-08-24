import { adminJsonResponse, authorizeAdminOperation } from "../../../../../../../lib/admin-api-request";
import { revokeAdminComparisonShare } from "../../../../../../../lib/comparison-admin-actions";
import { comparisonApiFailure } from "../../../../../../../lib/comparison-api";
import { isComparisonUuid } from "../../../../../../../lib/comparison-validation";
import { createPrivilegedSupabaseClient } from "../../../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string; shareId: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id, shareId } = await context.params;
  if (!isComparisonUuid(id) || !isComparisonUuid(shareId)) return adminJsonResponse({ success: false, error: "Invalid comparison data." }, 400);
  try {
    const updated = await revokeAdminComparisonShare(createPrivilegedSupabaseClient(), id, shareId, authorization.admin.userId);
    return updated ? adminJsonResponse({ success: true }) : adminJsonResponse({ success: false, error: "Active comparison share not found." }, 404);
  } catch (error) {
    return comparisonApiFailure(error, "share_revoke");
  }
}
