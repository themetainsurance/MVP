import {
  adminJsonResponse,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../lib/admin-api-request";
import { createAdminComparison } from "../../../lib/comparison-admin-actions";
import { comparisonApiFailure } from "../../../lib/comparison-api";
import {
  COMPARISON_METADATA_BODY_BYTES,
  validateComparisonCreateInput,
} from "../../../lib/comparison-validation";
import { createPrivilegedSupabaseClient } from "../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const body = await readAdminJsonBody(request, COMPARISON_METADATA_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateComparisonCreateInput(body.data);
  if (validation.success === false) {
    return adminJsonResponse({ success: false, error: validation.error }, 400);
  }
  try {
    const comparisonId = await createAdminComparison(
      createPrivilegedSupabaseClient(),
      validation.data,
      authorization.admin.userId
    );
    return adminJsonResponse({ success: true, comparisonId }, 201);
  } catch (error) {
    return comparisonApiFailure(error, "create");
  }
}
