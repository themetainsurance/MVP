import { NextResponse } from "next/server";
import {
  adminJsonResponse,
  adminServiceUnavailable,
  authorizeAdminOperation,
} from "../../../../../lib/admin-api-request";
import { resolveAdminPolicyDocument } from "../../../../../lib/admin-dashboard-actions";
import { isAdminUuid } from "../../../../../lib/admin-dashboard-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLICY_DOCUMENT_BUCKET = "policy-documents";
const SIGNED_URL_SECONDS = 120;

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isAdminUuid(id)) return adminJsonResponse({ success: false, error: "Record not found." }, 404);

  try {
    const client = createPrivilegedSupabaseClient();
    const result = await resolveAdminPolicyDocument(id, {
      async findPolicyPath(leadId) {
        const { data, error } = await client
          .from("leads")
          .select("policy_document_path")
          .eq("id", leadId)
          .maybeSingle();
        if (error) throw new Error("Policy lookup failed.");
        return data
          ? { found: true as const, path: data.policy_document_path as string | null }
          : { found: false as const };
      },
      async createSignedUrl(path) {
        const { data, error } = await client.storage
          .from(POLICY_DOCUMENT_BUCKET)
          .createSignedUrl(path, SIGNED_URL_SECONDS, { download: true });
        return error || !data?.signedUrl ? null : data.signedUrl;
      },
    });
    if (result.status === "not_found") {
      return adminJsonResponse({ success: false, error: "Record not found." }, 404);
    }

    const destination = new URL(result.signedUrl);
    if (destination.protocol !== "https:" && destination.protocol !== "http:") {
      throw new Error("Invalid signed URL protocol.");
    }
    const response = NextResponse.redirect(destination, 302);
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch {
    return adminServiceUnavailable("admin_policy_document_access_failed");
  }
}
