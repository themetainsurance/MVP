import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogArticleView from "../../../../../blog/components/BlogArticleView";
import { AdminPageHeader } from "../../../../components/AdminUi";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { loadAdminBlogPost } from "../../../../../lib/blog-admin-data";
import { getBlogImagePublicUrl } from "../../../../../lib/blog-public-data";
import { isBlogUuid } from "../../../../../lib/blog-validation";

export const metadata: Metadata = {
  title: "Blog preview",
  description: "Protected blog article preview.",
  robots: { index: false, follow: false },
};

export default async function AdminBlogPreviewPage({
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
      <AdminPageHeader
        eyebrow="PROTECTED PREVIEW"
        title="Preview unavailable"
        description="Blog CMS database setup is not available yet."
        actions={<Link className="admin-button admin-button-secondary" href="/admin/blog">Back to Blog</Link>}
      />
    );
  }
  if (!result.data.post) notFound();

  const post = result.data.post;
  return (
    <div className="admin-blog-preview">
      <div className="admin-preview-banner" role="note">
        Protected preview · {post.status} · This page is not public or indexable.
      </div>
      <BlogArticleView
        post={post}
        imageUrl={getBlogImagePublicUrl(post.featured_image_path)}
        preview
      />
    </div>
  );
}
