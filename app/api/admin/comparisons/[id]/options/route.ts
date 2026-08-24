import {
  adminJsonResponse,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../../../lib/admin-api-request";
import { createAdminComparisonOption } from "../../../../../lib/comparison-admin-actions";
import { comparisonApiFailure } from "../../../../../lib/comparison-api";
import { loadAdminComparisonDetail } from "../../../../../lib/comparison-admin-data";
import {
  COMPARISON_OPTION_BODY_BYTES,
  isComparisonUuid,
  validateComparisonOptionCreateInput,
} from "../../../../../lib/comparison-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isComparisonUuid(id)) return adminJsonResponse({ success: false, error: "Invalid comparison data." }, 400);
  const body = await readAdminJsonBody(request, COMPARISON_OPTION_BODY_BYTES);
  if (body.success === false) return body.response;
  const loaded = await loadAdminComparisonDetail(id);
  if (!loaded.available) return comparisonApiFailure(null, "option_load");
  if (!loaded.detail) return adminJsonResponse({ success: false, error: "Comparison not found." }, 404);
  const validation = validateComparisonOptionCreateInput(body.data, loaded.detail.comparison.insurance_type);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const optionId = await createAdminComparisonOption(createPrivilegedSupabaseClient(), id, validation.data, authorization.admin.userId);
    return adminJsonResponse({ success: true, optionId }, 201);
  } catch (error) {
    return comparisonApiFailure(error, "option_create");
  }
}
