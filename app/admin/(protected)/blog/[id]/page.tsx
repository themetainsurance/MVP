import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogEditor from "../../../components/BlogEditor";
import { AdminPageHeader } from "../../../components/AdminUi";
import { requireAdmin } from "../../../../lib/admin-auth";
import { loadAdminBlogPost } from "../../../../lib/blog-admin-data";
import { getBlogImagePublicUrl } from "../../../../lib/blog-public-data";
import { isBlogUuid } from "../../../../lib/blog-validation";

export const metadata: Metadata = {
  title: "Edit blog post",
  description: "Protected blog content editor.",
};

export default async function AdminBlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!isBlogUuid(id)) notFound();
  const result = await loadAdminBlogPost(id);

  if (!result.available) {
    return (
      <>
        <AdminPageHeader
          eyebrow="CONTENT MANAGEMENT"
          title="Blog unavailable"
          description="Blog CMS database setup is not available yet."
          actions={<Link className="admin-button admin-button-secondary" href="/admin/blog">Back to Blog</Link>}
        />
      </>
    );
  }
  if (!result.data.post) notFound();

  const post = result.data.post;
  return (
    <>
      <AdminPageHeader
        eyebrow="BLOG EDITOR"
        title={post.title}
        description="Save drafts, inspect a protected preview, manage SEO and featured media, then publish or archive without deleting URL history."
        actions={<Link className="admin-button admin-button-secondary" href="/admin/blog">Back to Blog</Link>}
      />
      <BlogEditor
        key={`${post.updated_at}-${post.status}-${post.featured_image_path ?? "no-image"}`}
        post={post}
        revisions={result.data.revisions}
        imageUrl={getBlogImagePublicUrl(post.featured_image_path)}
      />
    </>
  );
}
