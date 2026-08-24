import {
  adminJsonResponse,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../../../lib/admin-api-request";
import { changeAdminComparisonStatus } from "../../../../../lib/comparison-admin-actions";
import { comparisonApiFailure } from "../../../../../lib/comparison-api";
import {
  COMPARISON_METADATA_BODY_BYTES,
  isComparisonUuid,
  validateComparisonStatusInput,
} from "../../../../../lib/comparison-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isComparisonUuid(id)) return adminJsonResponse({ success: false, error: "Invalid comparison data." }, 400);
  const body = await readAdminJsonBody(request, COMPARISON_METADATA_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateComparisonStatusInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const updated = await changeAdminComparisonStatus(createPrivilegedSupabaseClient(), id, validation.data.status, authorization.admin.userId);
    return updated ? adminJsonResponse({ success: true }) : adminJsonResponse({ success: false, error: "Comparison not found." }, 404);
  } catch (error) {
    return comparisonApiFailure(error, "status");
  }
}
