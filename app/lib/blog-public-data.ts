import "server-only";

import type { BlogPost, PublicBlogCard } from "./blog-types";
import { createPrivilegedSupabaseClient } from "./supabase/admin-server";

const PUBLIC_CARD_COLUMNS =
  "id, updated_at, title, slug, excerpt, category, featured_image_path, featured_image_alt, published_at";

function publicCmsUnavailable(code: string) {
  console.error("Public blog CMS data unavailable.", { code });
}

export async function loadPublishedBlogCards(): Promise<PublicBlogCard[]> {
  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("blog_posts")
      .select(PUBLIC_CARD_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      publicCmsUnavailable("public_blog_list_unavailable");
      return [];
    }
    return (data ?? []) as PublicBlogCard[];
  } catch {
    publicCmsUnavailable("public_blog_list_configuration_unavailable");
    return [];
  }
}

export async function loadPublicBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .in("status", ["published", "archived"])
      .maybeSingle();

    if (error) {
      publicCmsUnavailable("public_blog_detail_unavailable");
      return null;
    }
    const post = (data as BlogPost | null) ?? null;
    if (
      !post ||
      (post.status === "archived" && post.first_published_at === null)
    ) {
      return null;
    }
    return post;
  } catch {
    publicCmsUnavailable("public_blog_detail_configuration_unavailable");
    return null;
  }
}

export async function loadPublishedBlogSitemapEntries(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  try {
    const { data, error } = await createPrivilegedSupabaseClient()
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1000);
    if (error) {
      publicCmsUnavailable("public_blog_sitemap_unavailable");
      return [];
    }
    return (data ?? []) as Array<{ slug: string; updated_at: string }>;
  } catch {
    publicCmsUnavailable("public_blog_sitemap_configuration_unavailable");
    return [];
  }
}

export function getBlogImagePublicUrl(path: string | null) {
  if (!path || !/^posts\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(path)) {
    return null;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  try {
    const encodedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return new URL(
      `/storage/v1/object/public/blog-images/${encodedPath}`,
      supabaseUrl
    ).toString();
  } catch {
    return null;
  }
}
