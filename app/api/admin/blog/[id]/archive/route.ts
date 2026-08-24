import {
  adminJsonResponse,
  adminOperationFailed,
  adminServiceUnavailable,
  authorizeAdminOperation,
} from "../../../../../lib/admin-api-request";
import { findBlogPostForMutation } from "../../../../../lib/blog-admin-data";
import { revalidateBlogPaths } from "../../../../../lib/blog-revalidation";
import {
  canTransitionBlogStatus,
  isBlogUuid,
} from "../../../../../lib/blog-validation";
import { createPrivilegedSupabaseClient } from "../../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authorization = await authorizeAdminOperation(request);
  if (authorization.success === false) return authorization.response;
  const { id } = await context.params;
  if (!isBlogUuid(id)) {
    return adminJsonResponse(
      { success: false, error: "Invalid blog post data." },
      400
    );
  }

  try {
    const client = createPrivilegedSupabaseClient();
    const current = await findBlogPostForMutation(client, id);
    if (!current) {
      return adminJsonResponse(
        { success: false, error: "Blog post not found." },
        404
      );
    }
    if (
      !canTransitionBlogStatus(
        current.status,
        "archived",
        current.first_published_at
      )
    ) {
      return adminJsonResponse(
        { success: false, error: "Operation could not be completed." },
        409
      );
    }

    const { data, error } = await client
      .from("blog_posts")
      .update({
        status: "archived",
        updated_by: authorization.admin.userId,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return adminOperationFailed("admin_blog_archive_failed");
    if (!data) {
      return adminJsonResponse(
        { success: false, error: "Blog post not found." },
        404
      );
    }

    revalidateBlogPaths(current.slug);
    return adminJsonResponse({ success: true });
  } catch (error) {
    return error instanceof Error && error.message === "blog_cms_unavailable"
      ? adminServiceUnavailable("admin_blog_archive_schema_unavailable")
      : adminServiceUnavailable("admin_blog_archive_unavailable");
  }
}
