import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageHeader,
  AdminPagination,
  EmptyState,
  formatAdminDate,
  formatAdminLabel,
  StatusBadge,
} from "../../components/AdminUi";
import { requireAdmin } from "../../../lib/admin-auth";
import { loadAdminBlogPosts } from "../../../lib/blog-admin-data";
import { BLOG_CATEGORIES, BLOG_POST_STATUSES } from "../../../lib/blog-types";
import {
  type BlogListFilters,
  validateBlogListFilters,
} from "../../../lib/blog-validation";

export const metadata: Metadata = {
  title: "Blog CMS",
  description: "Protected blog content administration.",
};

const defaultFilters: BlogListFilters = {
  status: null,
  category: null,
  search: "",
  page: 1,
};

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const validation = validateBlogListFilters(query);
  const filters = validation.success ? validation.data : defaultFilters;
  const result = await loadAdminBlogPosts(filters);

  return (
    <>
      <AdminPageHeader
        eyebrow="CONTENT MANAGEMENT"
        title="Blog"
        description="Create, preview, publish and archive Markdown articles while preserving published URLs and revision history."
        actions={
          <Link className="admin-button admin-button-primary" href="/admin/blog/new">
            New blog post
          </Link>
        }
      />

      <form className="admin-filter-grid" method="get">
        <label htmlFor="blog-status-filter">Status
          <select id="blog-status-filter" name="status" defaultValue={filters.status ?? "all"}>
            <option value="all">All statuses</option>
            {BLOG_POST_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}
          </select>
        </label>
        <label htmlFor="blog-category-filter">Category
          <select id="blog-category-filter" name="category" defaultValue={filters.category ?? "all"}>
            <option value="all">All categories</option>
            {BLOG_CATEGORIES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}
          </select>
        </label>
        <label htmlFor="blog-search-filter">Title or slug
          <input id="blog-search-filter" name="search" defaultValue={filters.search} maxLength={100} autoComplete="off" />
        </label>
        <button className="admin-button admin-button-primary" type="submit">Apply filters</button>
      </form>
      {validation.success === false ? <p className="admin-form-error" role="alert">Invalid blog filters were ignored.</p> : null}

      {result.available ? (
        <>
          <div className="admin-table-wrap admin-section">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Slug</th>
                  <th>Updated</th>
                  <th>First published</th>
                  <th>Current publish date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.data.items.map((post) => (
                  <tr key={post.id}>
                    <td><strong>{post.title}</strong></td>
                    <td>{formatAdminLabel(post.category)}</td>
                    <td><StatusBadge value={post.status} /></td>
                    <td><span className="admin-code">{post.slug}</span></td>
                    <td>{formatAdminDate(post.updated_at)}</td>
                    <td>{formatAdminDate(post.first_published_at)}</td>
                    <td>{formatAdminDate(post.published_at)}</td>
                    <td>
                      <div className="admin-actions-row">
                        <Link className="admin-text-link" href={`/admin/blog/${post.id}`}>Edit</Link>
                        <Link className="admin-text-link" href={`/admin/blog/${post.id}/preview`}>Preview</Link>
                        {post.status === "published" ? <a className="admin-text-link" href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">View public article</a> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!result.data.items.length ? <EmptyState>No blog posts found.</EmptyState> : null}
          </div>
          <AdminPagination
            page={result.data.page}
            totalPages={result.data.totalPages}
            total={result.data.total}
            pathname="/admin/blog"
            query={{
              status: filters.status,
              category: filters.category,
              search: filters.search || null,
            }}
          />
        </>
      ) : (
        <section className="admin-card admin-section" role="status">
          <h2>Blog CMS database setup is not available yet.</h2>
          <p className="admin-page-description">Apply the committed blog CMS migration before creating or editing CMS articles. Other admin areas remain available.</p>
        </section>
      )}
    </>
  );
}
