import {
  adminJsonResponse,
  adminOperationFailed,
  adminServiceUnavailable,
  authorizeAdminOperation,
  readAdminFormData,
} from "../../../../../lib/admin-api-request";
import { findBlogPostForMutation } from "../../../../../lib/blog-admin-data";
import {
  MAX_BLOG_IMAGE_REQUEST_BYTES,
  MAX_BLOG_IMAGE_SIZE_BYTES,
  validateBlogImage,
} from "../../../../../lib/blog-image-validation";
import { revalidateBlogPaths } from "../../../../../lib/blog-revalidation";
import {
  isBlogUuid,
  validateBlogImageAlt,
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

    const form = await readAdminFormData(
      request,
      MAX_BLOG_IMAGE_REQUEST_BYTES
    );
    if (form.success === false) return form.response;

    const files = form.data.getAll("file");
    const altValues = form.data.getAll("alt");
    if (
      files.length !== 1 ||
      !(files[0] instanceof File) ||
      altValues.length !== 1
    ) {
      return adminJsonResponse(
        { success: false, error: "Invalid upload data." },
        400
      );
    }

    const file = files[0];
    if (file.size === 0) {
      return adminJsonResponse(
        { success: false, error: "The uploaded image is empty." },
        400
      );
    }
    if (file.size > MAX_BLOG_IMAGE_SIZE_BYTES) {
      return adminJsonResponse(
        { success: false, error: "Maximum image size is 5 MB." },
        413
      );
    }

    const altValidation = validateBlogImageAlt(altValues[0]);
    if (altValidation.success === false) {
      return adminJsonResponse(
        { success: false, error: altValidation.error },
        400
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const imageValidation = validateBlogImage(bytes, file.type);
    if (imageValidation.success === false) {
      const error =
        imageValidation.reason === "empty"
          ? "The uploaded image is empty."
          : imageValidation.reason === "too_large"
            ? "Maximum image size is 5 MB."
            : "The uploaded file is not a valid JPEG, PNG or WEBP image.";
      return adminJsonResponse(
        { success: false, error },
        imageValidation.reason === "too_large" ? 413 : 400
      );
    }

    const objectPath = `posts/${id}/${crypto.randomUUID()}.${imageValidation.fileType.extension}`;
    const { error: uploadError } = await client.storage
      .from("blog-images")
      .upload(objectPath, bytes, {
        contentType: imageValidation.fileType.mimeType,
        cacheControl: "31536000",
        upsert: false,
      });
    if (uploadError) {
      return adminOperationFailed("admin_blog_image_upload_failed");
    }

    const { data, error: updateError } = await client
      .from("blog_posts")
      .update({
        featured_image_path: objectPath,
        featured_image_alt: altValidation.data,
        updated_by: authorization.admin.userId,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (updateError || !data) {
      const { error: cleanupError } = await client.storage
        .from("blog-images")
        .remove([objectPath]);
      if (cleanupError) {
        console.error("Admin blog image rollback failed.", {
          code: "admin_blog_image_rollback_failed",
        });
      }
      return adminOperationFailed("admin_blog_image_record_update_failed");
    }

    if (current.status !== "draft") revalidateBlogPaths(current.slug);
    return adminJsonResponse({ success: true });
  } catch (error) {
    return error instanceof Error && error.message === "blog_cms_unavailable"
      ? adminServiceUnavailable("admin_blog_image_schema_unavailable")
      : adminServiceUnavailable("admin_blog_image_upload_unavailable");
  }
}
