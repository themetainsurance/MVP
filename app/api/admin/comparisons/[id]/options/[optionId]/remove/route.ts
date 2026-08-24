import { adminJsonResponse, authorizeAdminOperation } from "../../../../../../../lib/admin-api-request";
import { removeAdminComparisonOption } from "../../../../../../../lib/comparison-admin-actions";
import { comparisonApiFailure } from "../../../../../../../lib/comparison-api";
import { loadAdminComparisonDetail } from "../../../../../../../lib/comparison-admin-data";
import { isComparisonUuid } from "../../../../../../../lib/comparison-validation";
import { createPrivilegedSupabaseClient } from "../../../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string; optionId: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id, optionId } = await context.params;
  if (!isComparisonUuid(id) || !isComparisonUuid(optionId)) return adminJsonResponse({ success: false, error: "Invalid comparison data." }, 400);
  const loaded = await loadAdminComparisonDetail(id);
  if (!loaded.available) return comparisonApiFailure(null, "option_load");
  if (!loaded.detail || !loaded.detail.options.some((option) => option.id === optionId)) return adminJsonResponse({ success: false, error: "Comparison option not found." }, 404);
  try {
    const updated = await removeAdminComparisonOption(createPrivilegedSupabaseClient(), id, optionId, authorization.admin.userId);
    return updated ? adminJsonResponse({ success: true }) : adminJsonResponse({ success: false, error: "Active comparison option not found." }, 404);
  } catch (error) {
    return comparisonApiFailure(error, "option_remove");
  }
}
