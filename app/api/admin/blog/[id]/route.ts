import {
  adminJsonResponse,
  adminOperationFailed,
  adminServiceUnavailable,
  authorizeAdminOperation,
  readAdminJsonBody,
} from "../../../../lib/admin-api-request";
import { findBlogPostForMutation } from "../../../../lib/blog-admin-data";
import { revalidateBlogPaths } from "../../../../lib/blog-revalidation";
import {
  BLOG_UPDATE_BODY_BYTES,
  isBlogUuid,
  validateBlogUpdateInput,
  validatePublishableBlogPost,
} from "../../../../lib/blog-validation";
import { createPrivilegedSupabaseClient } from "../../../../lib/supabase/admin-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function databaseErrorCode(value: unknown) {
  return value && typeof value === "object" && "code" in value
    ? String(value.code)
    : "";
}

export async function PATCH(
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

  const body = await readAdminJsonBody(request, BLOG_UPDATE_BODY_BYTES);
  if (body.success === false) return body.response;
  const validation = validateBlogUpdateInput(body.data);
  if (validation.success === false) {
    return adminJsonResponse(
      { success: false, error: validation.error },
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
      current.first_published_at !== null &&
      validation.data.slug !== current.slug
    ) {
      return adminJsonResponse(
        { success: false, error: "Published blog URLs cannot be changed." },
        409
      );
    }
    if (current.featured_image_path && !validation.data.featured_image_alt) {
      return adminJsonResponse(
        { success: false, error: "Featured image alt text is required." },
        400
      );
    }

    if (current.status === "published") {
      const publishValidation = validatePublishableBlogPost({
        ...current,
        ...validation.data,
      });
      if (publishValidation.success === false) {
        return adminJsonResponse(
          { success: false, error: publishValidation.error },
          400
        );
      }
    }

    const { data, error } = await client
      .from("blog_posts")
      .update({
        ...validation.data,
        updated_by: authorization.admin.userId,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      if (databaseErrorCode(error) === "23505") {
        return adminJsonResponse(
          { success: false, error: "This blog URL is already in use." },
          409
        );
      }
      return adminOperationFailed("admin_blog_update_failed");
    }
    if (!data) {
      return adminJsonResponse(
        { success: false, error: "Blog post not found." },
        404
      );
    }

    if (current.status !== "draft") revalidateBlogPaths(current.slug);
    return adminJsonResponse({ success: true });
  } catch (error) {
    return error instanceof Error && error.message === "blog_cms_unavailable"
      ? adminServiceUnavailable("admin_blog_update_schema_unavailable")
      : adminServiceUnavailable("admin_blog_update_unavailable");
  }
}
