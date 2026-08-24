import { adminJsonResponse, adminOperationFailed, adminServiceUnavailable, authorizeAdminOperation, readAdminJsonBody } from "../../../lib/admin-api-request";
import { createAdminConversion } from "../../../lib/admin-dashboard-actions";
import { ADMIN_OPERATION_BODY_BYTES, validateCreateConversionInput } from "../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const body = await readAdminJsonBody(request, ADMIN_OPERATION_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateCreateConversionInput(body.data);
  if (validation.success === false) return adminJsonResponse({ success: false, error: validation.error }, 400);
  try {
    const conversionId = await createAdminConversion(createPrivilegedSupabaseClient(), validation.data);
    return adminJsonResponse({ success: true, conversionId }, 201);
  } catch (error) {
    return error instanceof Error && error.message === "Trusted database operation failed."
      ? adminOperationFailed("admin_conversion_create_failed")
      : adminServiceUnavailable("admin_conversion_create_unavailable");
  }
}
