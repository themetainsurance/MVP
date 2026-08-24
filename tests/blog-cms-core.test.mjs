import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildDirectory = mkdtempSync(join(tmpdir(), "tmi-blog-cms-"));
const compiler = join(repositoryRoot, "node_modules", "typescript", "bin", "tsc");

execFileSync(process.execPath, [
  compiler,
  "--target", "ES2022",
  "--module", "commonjs",
  "--moduleResolution", "node",
  "--skipLibCheck",
  "--esModuleInterop",
  "--outDir", buildDirectory,
  join(repositoryRoot, "app", "lib", "blog-types.ts"),
  join(repositoryRoot, "app", "lib", "blog-validation.ts"),
  join(repositoryRoot, "app", "lib", "blog-image-validation.ts"),
], { stdio: "pipe" });

const require = createRequire(import.meta.url);
const types = require(join(buildDirectory, "blog-types.js"));
const validation = require(join(buildDirectory, "blog-validation.js"));
const images = require(join(buildDirectory, "blog-image-validation.js"));

after(() => rmSync(buildDirectory, { recursive: true, force: true }));

test("protects the exact current static blog slugs", () => {
  const blogRoot = join(repositoryRoot, "app", "blog");
  const staticSlugs = readdirSync(blogRoot)
    .filter((name) => {
      const path = join(blogRoot, name);
      return statSync(path).isDirectory() && existsSync(join(path, "page.tsx")) && !name.startsWith("[");
    })
    .sort();
  assert.deepEqual([...types.LEGACY_BLOG_SLUGS].sort(), staticSlugs);
  for (const slug of staticSlugs) {
    assert.equal(validation.isReservedLegacyBlogSlug(slug), true);
    assert.equal(validation.validateBlogCreateInput({ title: "New", slug, category: "general", author_name: "" }).success, false);
  }
});

test("validates and generates stable ASCII slugs", () => {
  for (const slug of ["valid-slug", "travel-insurance-2026"]) {
    assert.equal(validation.isValidBlogSlug(slug), true);
  }
  for (const slug of ["UPPERCASE", "has spaces", "has_underscore", "-leading", "trailing-", "ab"]) {
    assert.equal(validation.isValidBlogSlug(slug), false);
  }
  assert.equal(validation.generateBlogSlug("  Café & Travel Insurance 2026  "), "cafe-travel-insurance-2026");
});

test("allows only the specified blog lifecycle transitions", () => {
  assert.equal(validation.canTransitionBlogStatus("draft", "published"), true);
  assert.equal(validation.canTransitionBlogStatus("draft", "archived"), true);
  assert.equal(validation.canTransitionBlogStatus("published", "archived", "2026-01-01"), true);
  assert.equal(validation.canTransitionBlogStatus("archived", "published", "2026-01-01"), true);
  assert.equal(validation.canTransitionBlogStatus("published", "draft", "2026-01-01"), false);
  assert.equal(validation.canTransitionBlogStatus("archived", "draft", "2026-01-01"), false);
  assert.equal(validation.canTransitionBlogStatus("archived", "draft", null), true);
  assert.equal(validation.canTransitionBlogStatus("published", "published", "2026-01-01"), true);
});

test("requires complete content and metadata before publication", () => {
  const complete = {
    title: "Travel insurance guide",
    slug: "travel-insurance-new-guide",
    body_markdown: "## Useful information",
    meta_description: "A factual guide to travel insurance coverage.",
    featured_image_path: null,
    featured_image_alt: null,
  };
  assert.equal(validation.validatePublishableBlogPost(complete).success, true);
  assert.equal(validation.validatePublishableBlogPost({ ...complete, body_markdown: " " }).success, false);
  assert.equal(validation.validatePublishableBlogPost({ ...complete, meta_description: null }).success, false);
  assert.equal(validation.validatePublishableBlogPost({ ...complete, featured_image_path: "posts/id/image.jpg", featured_image_alt: null }).success, false);
});

test("classifies revision groups and ignores no-op updates", () => {
  const base = {
    title: "Title", slug: "valid-slug", excerpt: null, category: "general",
    body_markdown: "Body", author_name: null, seo_title: null,
    meta_description: "Description", featured_image_path: null,
    featured_image_alt: null, status: "draft", first_published_at: null,
    published_at: null, archived_at: null,
  };
  assert.equal(validation.classifyBlogRevisionChange(base, { ...base }), null);
  assert.equal(validation.classifyBlogRevisionChange(base, { ...base, title: "Changed" }), "content_update");
  assert.equal(validation.classifyBlogRevisionChange(base, { ...base, seo_title: "SEO" }), "seo_update");
  assert.equal(validation.classifyBlogRevisionChange(base, { ...base, featured_image_alt: "Alt" }), "media_update");
  assert.equal(validation.classifyBlogRevisionChange(base, { ...base, status: "published" }), "status_change");
  assert.equal(validation.classifyBlogRevisionChange(base, { ...base, title: "Changed", seo_title: "SEO" }), "mixed_update");
});

test("keeps blog search bounded and safe for server-side PostgREST filters", () => {
  assert.equal(validation.validateBlogListFilters({ search: "travel insurance-2026", page: "2" }).success, true);
  assert.equal(validation.validateBlogListFilters({ search: "title),status.eq.published", page: "1" }).success, false);
  assert.equal(validation.validateBlogListFilters({ search: "%", page: "1" }).success, false);
});

test("allows safe Markdown links and blocks active URL schemes", () => {
  for (const url of ["https://example.com", "http://example.com", "mailto:contact@example.com", "/travel", "../terms", "terms", "#coverage"]) {
    assert.equal(validation.isSafeBlogLink(url), true, url);
  }
  for (const url of ["javascript:alert(1)", "data:text/html,test", "vbscript:msgbox(1)", "//example.com", "java\\script:alert(1)"]) {
    assert.equal(validation.isSafeBlogLink(url), false, url);
    assert.equal(validation.safeBlogUrlTransform(url), "");
  }
});

test("accepts valid JPEG, PNG and WEBP signatures", () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const webp = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
  assert.equal(images.validateBlogImage(jpeg, "image/jpeg").success, true);
  assert.equal(images.validateBlogImage(png, "image/png").success, true);
  assert.equal(images.validateBlogImage(webp, "image/webp").success, true);
});

test("rejects empty, oversized, forged, mismatched and scriptable image uploads", () => {
  assert.equal(images.validateBlogImage(new Uint8Array(), "image/jpeg").reason, "empty");
  assert.equal(images.validateBlogImage(new Uint8Array(images.MAX_BLOG_IMAGE_SIZE_BYTES + 1), "image/png").reason, "too_large");
  assert.equal(images.validateBlogImage(Buffer.from("not really a jpg"), "image/jpeg").reason, "invalid_content");
  assert.equal(images.validateBlogImage(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]), "image/png").reason, "invalid_content");
  assert.equal(images.validateBlogImage(Buffer.from("<svg onload=alert(1)></svg>"), "image/svg+xml").reason, "invalid_content");
  assert.equal(images.validateBlogImage(Buffer.from("<html><script>alert(1)</script></html>"), "text/html").reason, "invalid_content");
});

test("Markdown rendering skips raw HTML and inline images", () => {
  const source = readFileSync(join(repositoryRoot, "app", "blog", "components", "BlogMarkdown.tsx"), "utf8");
  assert.match(source, /skipHtml/);
  assert.match(source, /img\(\)/);
  assert.match(source, /return null/);
  assert.doesNotMatch(source, /rehype-raw|rehypeRaw|dangerouslySetInnerHTML/);
});

test("unsafe Markdown cannot render active HTML while normal GFM still renders", () => {
  const markdown = [
    "## Safe heading",
    "**Useful text**",
    "[unsafe](javascript:alert(1))",
    "[contact](mailto:contact@example.com)",
    "<script>alert(1)</script>",
    "<iframe src=\"https://example.com\"></iframe>",
    "<img src=x onerror=alert(1)>",
    "| Coverage | Included |\n| --- | --- |\n| Medical | Yes |",
  ].join("\n\n");
  const html = renderToStaticMarkup(createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm],
    skipHtml: true,
    urlTransform: validation.safeBlogUrlTransform,
    components: { img: () => null },
    children: markdown,
  }));
  assert.match(html, /<h2>Safe heading<\/h2>/);
  assert.match(html, /<strong>Useful text<\/strong>/);
  assert.match(html, /<table>/);
  assert.match(html, /mailto:contact@example\.com/);
  assert.doesNotMatch(html, /script|iframe|onerror|javascript:/i);
});

test("migration enforces lifecycle timestamps, immutable slugs and no hard delete", () => {
  const migrations = readdirSync(join(repositoryRoot, "supabase", "migrations"));
  const migrationName = migrations.find((name) => name.endsWith("_create_blog_cms.sql"));
  assert.ok(migrationName);
  const sql = readFileSync(join(repositoryRoot, "supabase", "migrations", migrationName), "utf8");
  assert.match(sql, /first_published_at is not null and new\.slug is distinct from old\.slug/i);
  for (const slug of types.LEGACY_BLOG_SLUGS) assert.match(sql, new RegExp(slug));
  assert.match(sql, /new\.first_published_at = now\(\)/i);
  assert.match(sql, /new\.published_at = now\(\)/i);
  assert.match(sql, /new\.archived_at = now\(\)/i);
  assert.match(sql, /create trigger blog_posts_prevent_delete/i);
  assert.match(sql, /raise exception 'Blog posts cannot be hard-deleted/i);
  assert.match(sql, /grant select, insert, update on table public\.blog_posts\s+to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]*delete[^;]*blog_posts[^;]*service_role/i);
});

test("migration stores OLD revision snapshots with constrained change types", () => {
  const migrationName = readdirSync(join(repositoryRoot, "supabase", "migrations")).find((name) => name.endsWith("_create_blog_cms.sql"));
  const sql = readFileSync(join(repositoryRoot, "supabase", "migrations", migrationName), "utf8");
  assert.match(sql, /insert into public\.blog_post_revisions/i);
  assert.match(sql, /old\.title/i);
  assert.match(sql, /old\.body_markdown/i);
  for (const value of types.BLOG_REVISION_CHANGE_TYPES) assert.match(sql, new RegExp(value));
});

test("migration creates only the constrained public blog image bucket", () => {
  const migrationName = readdirSync(join(repositoryRoot, "supabase", "migrations")).find((name) => name.endsWith("_create_blog_cms.sql"));
  const sql = readFileSync(join(repositoryRoot, "supabase", "migrations", migrationName), "utf8");
  assert.match(sql, /'blog-images'/);
  assert.match(sql, /5242880/);
  assert.match(sql, /'image\/jpeg', 'image\/png', 'image\/webp'/);
  assert.doesNotMatch(sql, /image\/svg\+xml|text\/html|application\/pdf|image\/gif/);
  assert.doesNotMatch(sql, /create policy/i);
});

test("CMS exposes no delete route or delete button", () => {
  const apiRoot = join(repositoryRoot, "app", "api", "admin", "blog");
  const routes = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name === "route.ts") routes.push(path);
    }
  }
  visit(apiRoot);
  for (const path of routes) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /export async function DELETE/);
    assert.match(source, /authorizeAdminOperation\(request\)/);
  }
  const editor = readFileSync(join(repositoryRoot, "app", "admin", "components", "BlogEditor.tsx"), "utf8");
  assert.doesNotMatch(editor, />\s*Delete\s*</);
});
