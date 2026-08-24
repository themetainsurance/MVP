import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BlogCmsResult,
  BlogPageResult,
  BlogPost,
  BlogPostListItem,
  BlogPostRevisionSummary,
} from "./blog-types";
import {
  BLOG_ADMIN_PAGE_SIZE,
  type BlogListFilters,
} from "./blog-validation";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";

const BLOG_LIST_COLUMNS =
  "id, created_at, updated_at, created_by, updated_by, title, slug, excerpt, category, status, author_name, seo_title, meta_description, featured_image_path, featured_image_alt, first_published_at, published_at, archived_at";
const BLOG_DETAIL_COLUMNS = `${BLOG_LIST_COLUMNS}, body_markdown`;

function unavailable<T>(data: T, code: string): BlogCmsResult<T> {
  console.error("Admin blog data unavailable.", { code });
  return { available: false, data };
}

export async function loadAdminBlogPosts(
  filters: BlogListFilters
): Promise<BlogCmsResult<BlogPageResult>> {
  const empty: BlogPageResult = {
    items: [],
    page: filters.page,
    pageSize: BLOG_ADMIN_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  try {
    const client = createPrivilegedSupabaseClient();
    const from = (filters.page - 1) * BLOG_ADMIN_PAGE_SIZE;
    let query = client
      .from("blog_posts")
      .select(BLOG_LIST_COLUMNS, { count: "exact" });

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`
      );
    }

    const { data, count, error } = await query
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + BLOG_ADMIN_PAGE_SIZE - 1);

    if (error) return unavailable(empty, "admin_blog_list_unavailable");
    const total = count ?? 0;
    return {
      available: true,
      data: {
        items: (data ?? []) as BlogPostListItem[],
        page: filters.page,
        pageSize: BLOG_ADMIN_PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / BLOG_ADMIN_PAGE_SIZE)),
      },
    };
  } catch {
    return unavailable(empty, "admin_blog_list_configuration_unavailable");
  }
}

export async function loadAdminBlogPost(
  id: string
): Promise<
  BlogCmsResult<{
    post: BlogPost | null;
    revisions: BlogPostRevisionSummary[];
  }>
> {
  const empty = { post: null, revisions: [] };
  try {
    const client = createPrivilegedSupabaseClient();
    const { data: postData, error: postError } = await client
      .from("blog_posts")
      .select(BLOG_DETAIL_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (postError) {
      return unavailable(empty, "admin_blog_detail_unavailable");
    }
    if (!postData) return { available: true, data: empty };

    const { data: revisionData, error: revisionError } = await client
      .from("blog_post_revisions")
      .select(
        "id, blog_post_id, created_at, changed_by, change_type, title, slug, status"
      )
      .eq("blog_post_id", id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(100);

    if (revisionError) {
      return unavailable(empty, "admin_blog_revisions_unavailable");
    }

    return {
      available: true,
      data: {
        post: postData as BlogPost,
        revisions: (revisionData ?? []) as BlogPostRevisionSummary[],
      },
    };
  } catch {
    return unavailable(empty, "admin_blog_detail_configuration_unavailable");
  }
}

export async function findBlogPostForMutation(
  client: SupabaseClient,
  id: string
) {
  const { data, error } = await client
    .from("blog_posts")
    .select(BLOG_DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("blog_cms_unavailable");
  return (data as BlogPost | null) ?? null;
}
