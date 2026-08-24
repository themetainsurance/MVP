import type { Metadata } from "next";
import Link from "next/link";
import BlogCreateForm from "../../../components/BlogCreateForm";
import { AdminPageHeader } from "../../../components/AdminUi";
import { requireAdmin } from "../../../../lib/admin-auth";

export const metadata: Metadata = {
  title: "New blog post",
  description: "Create a protected blog draft.",
};

export default async function NewAdminBlogPostPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader
        eyebrow="CONTENT MANAGEMENT"
        title="New blog post"
        description="Create the initial draft, then continue in the full content, SEO, image and publishing editor."
        actions={<Link className="admin-button admin-button-secondary" href="/admin/blog">Back to Blog</Link>}
      />
      <section className="admin-card admin-blog-new-card">
        <BlogCreateForm />
      </section>
    </>
  );
}
