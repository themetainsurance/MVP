import {
  adminJsonResponse,
  adminServiceUnavailable,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../../lib/admin-api-request";
import { loadAdminLeads } from "../../../../lib/admin-dashboard-data";
import {
  ADMIN_STATUS_BODY_BYTES,
  validateLeadListFilters,
} from "../../../../lib/admin-dashboard-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const body = await readAdminJsonBody(request, ADMIN_STATUS_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateLeadListFilters(body.data);
  if (validation.success === false) {
    return adminJsonResponse({ success: false, error: validation.error }, 400);
  }
  try {
    const result = await loadAdminLeads(validation.data);
    return adminJsonResponse({ success: true, result });
  } catch {
    return adminServiceUnavailable("admin_lead_search_failed");
  }
}
