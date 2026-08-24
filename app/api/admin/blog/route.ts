import {
  adminJsonResponse,
  adminOperationFailed,
  adminServiceUnavailable,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../lib/admin-api-request";
import {
  BLOG_CREATE_BODY_BYTES,
  validateBlogCreateInput,
} from "../../../lib/blog-validation";
import { createPrivilegedSupabaseClient } from "../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function databaseErrorCode(value: unknown) {
  return value && typeof value === "object" && "code" in value
    ? String(value.code)
    : "";
}

export async function POST(request: Request) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;

  const body = await readAdminJsonBody(request, BLOG_CREATE_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateBlogCreateInput(body.data);
  if (validation.success === false) {
    return adminJsonResponse(
      { success: false, error: validation.error },
      400
    );
  }

  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("blog_posts")
      .insert({
        ...validation.data,
        status: "draft",
        created_by: authorization.admin.userId,
        updated_by: authorization.admin.userId,
      })
      .select("id")
      .single();

    if (error) {
      if (databaseErrorCode(error) === "23505") {
        return adminJsonResponse(
          { success: false, error: "This blog URL is already in use." },
          409
        );
      }
      if (["42P01", "PGRST205"].includes(databaseErrorCode(error))) {
        return adminServiceUnavailable("admin_blog_create_schema_unavailable");
      }
      return adminOperationFailed("admin_blog_create_failed");
    }
    if (!data) return adminOperationFailed("admin_blog_create_missing_result");

    return adminJsonResponse({ success: true, postId: data.id }, 201);
  } catch {
    return adminServiceUnavailable("admin_blog_create_unavailable");
  }
}
