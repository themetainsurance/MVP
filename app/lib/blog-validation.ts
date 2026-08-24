import {
  BLOG_CATEGORIES,
  BLOG_POST_STATUSES,
  LEGACY_BLOG_SLUGS,
  type BlogCategory,
  type BlogPostStatus,
  type BlogRevisionChangeType,
} from "./blog-types";

export const BLOG_ADMIN_PAGE_SIZE = 25;
export const BLOG_CREATE_BODY_BYTES = 16 * 1024;
export const BLOG_UPDATE_BODY_BYTES = 256 * 1024;
export const BLOG_BODY_MAX_CHARS = 200_000;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEARCH_PATTERN = /^[\p{L}\p{N} .-]*$/u;
const RESERVED_SLUGS = new Set<string>(LEGACY_BLOG_SLUGS);

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type BlogCreateInput = {
  title: string;
  slug: string;
  category: BlogCategory;
  author_name: string | null;
};

export type BlogUpdateInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  category: BlogCategory;
  body_markdown: string;
  author_name: string | null;
  seo_title: string | null;
  meta_description: string | null;
  featured_image_alt: string | null;
};

export type BlogListFilters = {
  status: BlogPostStatus | null;
  category: BlogCategory | null;
  search: string;
  page: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requiredText(
  value: unknown,
  maximum: number
): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maximum
    ? normalized
    : null;
}

function optionalText(
  value: unknown,
  maximum: number
): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized || normalized.length > maximum) return undefined;
  return normalized;
}

function isBlogCategory(value: unknown): value is BlogCategory {
  return (
    typeof value === "string" &&
    BLOG_CATEGORIES.includes(value as BlogCategory)
  );
}

export function isBlogPostStatus(value: unknown): value is BlogPostStatus {
  return (
    typeof value === "string" &&
    BLOG_POST_STATUSES.includes(value as BlogPostStatus)
  );
}

export function isBlogUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function isValidBlogSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 3 &&
    value.length <= 160 &&
    SLUG_PATTERN.test(value)
  );
}

export function isReservedLegacyBlogSlug(slug: string) {
  return RESERVED_SLUGS.has(slug);
}

export function generateBlogSlug(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");
}

export function validateBlogCreateInput(
  value: unknown
): ValidationResult<BlogCreateInput> {
  if (!isRecord(value)) {
    return { success: false, error: "Invalid blog post data." };
  }

  const title = requiredText(value.title, 180);
  const slug = typeof value.slug === "string" ? value.slug.trim() : "";
  const authorName = optionalText(value.author_name, 120);

  if (
    !title ||
    !isValidBlogSlug(slug) ||
    !isBlogCategory(value.category) ||
    authorName === undefined
  ) {
    return { success: false, error: "Invalid blog post data." };
  }

  if (isReservedLegacyBlogSlug(slug)) {
    return { success: false, error: "This blog URL is already in use." };
  }

  return {
    success: true,
    data: {
      title,
      slug,
      category: value.category,
      author_name: authorName,
    },
  };
}

export function validateBlogUpdateInput(
  value: unknown
): ValidationResult<BlogUpdateInput> {
  if (!isRecord(value)) {
    return { success: false, error: "Invalid blog post data." };
  }

  const title = requiredText(value.title, 180);
  const slug = typeof value.slug === "string" ? value.slug.trim() : "";
  const excerpt = optionalText(value.excerpt, 320);
  const authorName = optionalText(value.author_name, 120);
  const seoTitle = optionalText(value.seo_title, 70);
  const metaDescription = optionalText(value.meta_description, 180);
  const imageAlt = optionalText(value.featured_image_alt, 300);

  if (
    !title ||
    !isValidBlogSlug(slug) ||
    !isBlogCategory(value.category) ||
    typeof value.body_markdown !== "string" ||
    value.body_markdown.length > BLOG_BODY_MAX_CHARS ||
    excerpt === undefined ||
    authorName === undefined ||
    seoTitle === undefined ||
    metaDescription === undefined ||
    imageAlt === undefined
  ) {
    return { success: false, error: "Invalid blog post data." };
  }

  if (isReservedLegacyBlogSlug(slug)) {
    return { success: false, error: "This blog URL is already in use." };
  }

  return {
    success: true,
    data: {
      title,
      slug,
      excerpt,
      category: value.category,
      body_markdown: value.body_markdown,
      author_name: authorName,
      seo_title: seoTitle,
      meta_description: metaDescription,
      featured_image_alt: imageAlt,
    },
  };
}

export function validateBlogImageAlt(value: unknown) {
  const alt = optionalText(value, 300);
  return alt === undefined || alt === null
    ? { success: false as const, error: "Featured image alt text is required." }
    : { success: true as const, data: alt };
}

export function validateBlogListFilters(
  value: Record<string, string | string[] | undefined>
): ValidationResult<BlogListFilters> {
  const first = (item: string | string[] | undefined) =>
    Array.isArray(item) ? item[0] : item;
  const rawStatus = first(value.status) ?? "all";
  const rawCategory = first(value.category) ?? "all";
  const rawSearch = (first(value.search) ?? "").trim();
  const rawPage = first(value.page) ?? "1";
  const page = Number(rawPage);

  const status: BlogPostStatus | null =
    rawStatus === "all" || !isBlogPostStatus(rawStatus) ? null : rawStatus;
  const category: BlogCategory | null =
    rawCategory === "all" || !isBlogCategory(rawCategory)
      ? null
      : rawCategory;

  if (
    (rawStatus !== "all" && !isBlogPostStatus(rawStatus)) ||
    (rawCategory !== "all" && !isBlogCategory(rawCategory)) ||
    rawSearch.length > 100 ||
    !SEARCH_PATTERN.test(rawSearch) ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 100_000
  ) {
    return { success: false, error: "Invalid blog filters." };
  }

  return {
    success: true,
    data: {
      status,
      category,
      search: rawSearch,
      page,
    },
  };
}

export function canTransitionBlogStatus(
  current: BlogPostStatus,
  next: BlogPostStatus,
  firstPublishedAt: string | null = null
) {
  if (current === next) return true;
  if (current === "draft") {
    return next === "published" || next === "archived";
  }
  if (current === "published") return next === "archived";
  if (next === "published") return true;
  return next === "draft" && firstPublishedAt === null;
}

export function validatePublishableBlogPost(post: {
  title: string;
  slug: string;
  body_markdown: string;
  meta_description: string | null;
  featured_image_path: string | null;
  featured_image_alt: string | null;
}) {
  const valid =
    Boolean(post.title.trim()) &&
    isValidBlogSlug(post.slug) &&
    Boolean(post.body_markdown.trim()) &&
    Boolean(post.meta_description?.trim()) &&
    (!post.featured_image_path || Boolean(post.featured_image_alt?.trim()));

  return valid
    ? { success: true as const }
    : {
        success: false as const,
        error:
          "Add article content, a valid slug, a meta description, and image alt text where required before publishing.",
      };
}

const CONTENT_FIELDS = [
  "title",
  "slug",
  "excerpt",
  "category",
  "body_markdown",
  "author_name",
] as const;
const SEO_FIELDS = ["seo_title", "meta_description"] as const;
const MEDIA_FIELDS = ["featured_image_path", "featured_image_alt"] as const;
const STATUS_FIELDS = [
  "status",
  "first_published_at",
  "published_at",
  "archived_at",
] as const;

export function classifyBlogRevisionChange(
  previous: Record<string, unknown>,
  next: Record<string, unknown>
): BlogRevisionChangeType | null {
  const changed = (fields: readonly string[]) =>
    fields.some((field) => previous[field] !== next[field]);
  const groups = [
    [changed(CONTENT_FIELDS), "content_update"],
    [changed(SEO_FIELDS), "seo_update"],
    [changed(MEDIA_FIELDS), "media_update"],
    [changed(STATUS_FIELDS), "status_change"],
  ] as const;
  const changedGroups = groups.filter(([didChange]) => didChange);
  if (changedGroups.length === 0) return null;
  return changedGroups.length > 1
    ? "mixed_update"
    : changedGroups[0][1];
}

export function isSafeBlogLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f\u007f\\]/.test(trimmed)) return false;
  if (trimmed.startsWith("//")) return false;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("#")
  ) {
    return true;
  }

  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return true;

  try {
    const url = new URL(trimmed);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function safeBlogUrlTransform(value: string) {
  return isSafeBlogLink(value) ? value : "";
}
