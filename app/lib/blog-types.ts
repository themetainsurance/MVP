export const BLOG_POST_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export type BlogPostStatus = (typeof BLOG_POST_STATUSES)[number];

export const BLOG_CATEGORIES = [
  "travel",
  "motor",
  "property",
  "general",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_REVISION_CHANGE_TYPES = [
  "content_update",
  "seo_update",
  "media_update",
  "status_change",
  "mixed_update",
] as const;

export type BlogRevisionChangeType =
  (typeof BLOG_REVISION_CHANGE_TYPES)[number];

// Derived from the exact static route directories under app/blog. These URLs
// remain outside the CMS until a separately controlled migration is planned.
export const LEGACY_BLOG_SLUGS = [
  "how-to-compare-insurance-policies",
  "insurance-renewal-checklist",
  "motor-insurance-guide",
  "property-insurance-guide",
  "travel-insurance-guide",
] as const;

export type BlogPost = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  category: BlogCategory;
  body_markdown: string;
  status: BlogPostStatus;
  author_name: string | null;
  seo_title: string | null;
  meta_description: string | null;
  featured_image_path: string | null;
  featured_image_alt: string | null;
  first_published_at: string | null;
  published_at: string | null;
  archived_at: string | null;
};

export type BlogPostListItem = Omit<BlogPost, "body_markdown">;

export type PublicBlogCard = Pick<
  BlogPost,
  | "id"
  | "updated_at"
  | "title"
  | "slug"
  | "excerpt"
  | "category"
  | "featured_image_path"
  | "featured_image_alt"
  | "published_at"
>;

export type BlogPostRevisionSummary = {
  id: string;
  blog_post_id: string;
  created_at: string;
  changed_by: string | null;
  change_type: BlogRevisionChangeType;
  title: string;
  slug: string;
  status: BlogPostStatus;
};

export type BlogPageResult = {
  items: BlogPostListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type BlogCmsResult<T> =
  | { available: true; data: T }
  | { available: false; data: T };
