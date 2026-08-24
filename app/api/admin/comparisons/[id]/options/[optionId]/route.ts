import {
  adminJsonResponse,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../../../../lib/admin-api-request";
import { updateAdminComparisonOption } from "../../../../../../lib/comparison-admin-actions";
import { comparisonApiFailure } from "../../../../../../lib/comparison-api";
import { loadAdminComparisonDetail } from "../../../../../../lib/comparison-admin-data";
import {
  COMPARISON_OPTION_BODY_BYTES,
  isComparisonUuid,
  validateComparisonOptionUpdateInput,
} from "../../../../../../lib/comparison-validation";
import { createPrivilegedSupabaseClient } from "../../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; optionId: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id, optionId } = await context.params;
  if (!isComparisonUuid(id) || !isComparisonUuid(optionId)) return adminJsonResponse({ success: false, error: "Invalid comparison data." }, 400);
  const body = await readAdminJsonBody(request, COMPARISON_OPTION_BODY_BYTES);
  if (body.success === false) return body.response;
  const loaded = await loadAdminComparisonDetail(id);
  if (!loaded.available) return comparisonApiFailure(null, "option_load");
  if (!loaded.detail || !loaded.detail.options.some((option) => option.id === optionId)) return adminJsonResponse({ success: false, error: "Comparison option not found." }, 404);
  const validation = validateComparisonOptionUpdateInput(body.data, loaded.detail.comparison.insurance_type);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const updated = await updateAdminComparisonOption(createPrivilegedSupabaseClient(), id, optionId, validation.data, authorization.admin.userId);
    return updated ? adminJsonResponse({ success: true }) : adminJsonResponse({ success: false, error: "Comparison option not found." }, 404);
  } catch (error) {
    return comparisonApiFailure(error, "option_update");
  }
}
