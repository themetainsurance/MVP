"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  BLOG_CATEGORIES,
  type BlogPost,
  type BlogPostRevisionSummary,
} from "../../lib/blog-types";
import { BLOG_BODY_MAX_CHARS } from "../../lib/blog-validation";
import { formatAdminDate, formatAdminLabel, StatusBadge } from "./AdminUi";

type EditorFields = {
  title: string;
  slug: string;
  category: string;
  author_name: string;
  excerpt: string;
  body_markdown: string;
  seo_title: string;
  meta_description: string;
  featured_image_alt: string;
};

export default function BlogEditor({
  post,
  revisions,
  imageUrl,
}: {
  post: BlogPost;
  revisions: BlogPostRevisionSummary[];
  imageUrl: string | null;
}) {
  const router = useRouter();
  const [fields, setFields] = useState<EditorFields>({
    title: post.title,
    slug: post.slug,
    category: post.category,
    author_name: post.author_name ?? "",
    excerpt: post.excerpt ?? "",
    body_markdown: post.body_markdown,
    seo_title: post.seo_title ?? "",
    meta_description: post.meta_description ?? "",
    featured_image_alt: post.featured_image_alt ?? "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function update(field: keyof EditorFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function request(endpoint: string, options: RequestInit) {
    const response = await fetch(endpoint, {
      ...options,
      credentials: "same-origin",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return { success: false as const, error: "Unauthorized." };
      }
      return {
        success: false as const,
        error: result?.error || "Operation could not be completed.",
      };
    }
    return { success: true as const, result };
  }

  async function save(
    showSuccess = true,
    overrides: Partial<EditorFields> = {}
  ) {
    const result = await request(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, ...overrides }),
    });
    if (!result.success) {
      setError(result.error);
      return false;
    }
    if (showSuccess) setMessage("Article saved.");
    return true;
  }

  async function submitSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    try {
      if (await save()) router.refresh();
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  async function lifecycleAction(
    action: "publish" | "archive",
    confirmation: string
  ) {
    if (!window.confirm(confirmation)) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      if (!(await save(false))) return;
      const result = await request(`/api/admin/blog/${post.id}/${action}`, {
        method: "POST",
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage(action === "publish" ? "Article published." : "Article archived.");
      router.refresh();
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  async function uploadFeaturedImage() {
    if (!selectedImage) {
      setError("Choose an image to upload.");
      return;
    }
    setPending(true);
    setError("");
    setMessage("");
    try {
      if (!(await save(false))) return;
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("alt", fields.featured_image_alt);
      const result = await request(
        `/api/admin/blog/${post.id}/featured-image`,
        { method: "POST", body: formData }
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSelectedImage(null);
      setMessage("Featured image uploaded.");
      router.refresh();
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  async function removeFeaturedImage() {
    if (!window.confirm("Remove this image from the current article? The stored object will be preserved for revision history.")) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await request(
        `/api/admin/blog/${post.id}/remove-featured-image`,
        { method: "POST" }
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (!(await save(false, { featured_image_alt: "" }))) return;
      update("featured_image_alt", "");
      setMessage("Featured image removed from the current article.");
      router.refresh();
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  const slugLocked = post.first_published_at !== null;
  const publicUrl = `/blog/${post.slug}`;
  const publishLabel = post.status === "archived" && post.first_published_at
    ? "Republish"
    : "Publish";

  return (
    <form className="admin-blog-editor" onSubmit={submitSave} noValidate>
      <section className="admin-card admin-blog-section" aria-labelledby="content-heading">
        <h2 id="content-heading">Content</h2>
        <div className="admin-form">
          <label htmlFor="editor-title">Title
            <input id="editor-title" value={fields.title} onChange={(event) => update("title", event.target.value)} required maxLength={180} />
          </label>
          <div className="admin-grid admin-grid-2">
            <label htmlFor="editor-slug">Slug
              <input id="editor-slug" value={fields.slug} onChange={(event) => update("slug", event.target.value)} required minLength={3} maxLength={160} disabled={slugLocked} aria-describedby="editor-slug-help" />
            </label>
            <label htmlFor="editor-category">Category
              <select id="editor-category" value={fields.category} onChange={(event) => update("category", event.target.value)}>
                {BLOG_CATEGORIES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}
              </select>
            </label>
          </div>
          <p className="admin-help" id="editor-slug-help">
            {slugLocked ? "This URL is immutable because the article has been published." : "Lowercase ASCII letters, numbers and hyphens only. Title changes do not change this slug."}
          </p>
          <label htmlFor="editor-author">Author / display name (optional)
            <input id="editor-author" value={fields.author_name} onChange={(event) => update("author_name", event.target.value)} maxLength={120} />
          </label>
          <label htmlFor="editor-excerpt">Excerpt (optional)
            <textarea id="editor-excerpt" value={fields.excerpt} onChange={(event) => update("excerpt", event.target.value)} maxLength={320} />
            <span className="admin-character-counter">{fields.excerpt.length} / 320</span>
          </label>
          <label htmlFor="editor-body">Body (Markdown)
            <textarea className="admin-blog-body" id="editor-body" value={fields.body_markdown} onChange={(event) => update("body_markdown", event.target.value)} maxLength={BLOG_BODY_MAX_CHARS} aria-describedby="editor-body-help" />
            <span className="admin-character-counter">{fields.body_markdown.length.toLocaleString()} / {BLOG_BODY_MAX_CHARS.toLocaleString()}</span>
          </label>
          <p className="admin-help" id="editor-body-help">Markdown and GFM formatting are supported. MDX, raw HTML, scripts, iframes and inline image rendering are disabled.</p>
        </div>
      </section>

      <section className="admin-card admin-blog-section" aria-labelledby="seo-heading">
        <h2 id="seo-heading">SEO</h2>
        <div className="admin-form">
          <label htmlFor="editor-seo-title">SEO title (optional)
            <input id="editor-seo-title" value={fields.seo_title} onChange={(event) => update("seo_title", event.target.value)} maxLength={70} aria-describedby="seo-title-help" />
            <span className="admin-character-counter">{fields.seo_title.length} / 70</span>
          </label>
          <p className="admin-help" id="seo-title-help">A practical display target is around 50–60 characters; search engines decide how titles appear. The article title is used when this is blank.</p>
          <label htmlFor="editor-meta-description">Meta description
            <textarea id="editor-meta-description" value={fields.meta_description} onChange={(event) => update("meta_description", event.target.value)} maxLength={180} aria-describedby="meta-description-help" />
            <span className="admin-character-counter">{fields.meta_description.length} / 180</span>
          </label>
          <p className="admin-help" id="meta-description-help">A practical display target is around 140–160 characters; search engines decide the final snippet. A non-blank description is required to publish.</p>
        </div>
      </section>

      <section className="admin-card admin-blog-section" aria-labelledby="image-heading">
        <h2 id="image-heading">Featured image</h2>
        {imageUrl && post.featured_image_alt ? <img className="admin-blog-image-preview" src={imageUrl} alt={post.featured_image_alt} width={1000} height={525} /> : <p className="admin-muted">No featured image attached.</p>}
        <div className="admin-form">
          <label htmlFor="editor-image-alt">Featured image alt text
            <input id="editor-image-alt" value={fields.featured_image_alt} onChange={(event) => update("featured_image_alt", event.target.value)} maxLength={300} aria-describedby="image-alt-help" />
          </label>
          <p className="admin-help" id="image-alt-help">Describe the image for accessibility and search engines.</p>
          <label htmlFor="editor-image-file">Upload / Replace featured image
            <input id="editor-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)} />
          </label>
          <p className="admin-help">JPEG, PNG or WEBP. Maximum 5 MB. The original file name is not retained.</p>
          <div className="admin-actions-row">
            <button className="admin-button admin-button-secondary" type="button" disabled={pending || !selectedImage} onClick={() => void uploadFeaturedImage()}>{post.featured_image_path ? "Replace featured image" : "Upload featured image"}</button>
            {post.featured_image_path ? <button className="admin-button admin-button-secondary" type="button" disabled={pending} onClick={() => void removeFeaturedImage()}>Remove from current post</button> : null}
          </div>
        </div>
      </section>

      <section className="admin-card admin-blog-section" aria-labelledby="publishing-heading">
        <h2 id="publishing-heading">Publishing</h2>
        <dl className="admin-detail-list">
          <div><dt>Status</dt><dd><StatusBadge value={post.status} /></dd></div>
          <div><dt>First published</dt><dd>{formatAdminDate(post.first_published_at)}</dd></div>
          <div><dt>Current publish date</dt><dd>{formatAdminDate(post.published_at)}</dd></div>
          <div><dt>Last updated</dt><dd>{formatAdminDate(post.updated_at)}</dd></div>
        </dl>
        <div className="admin-actions-row admin-blog-actions">
          <button className="admin-button admin-button-primary" type="submit" disabled={pending}>{pending ? "Working…" : "Save"}</button>
          <a className="admin-button admin-button-secondary" href={`/admin/blog/${post.id}/preview`}>Preview</a>
          {post.status !== "published" ? <button className="admin-button admin-button-primary" type="button" disabled={pending} onClick={() => void lifecycleAction("publish", post.status === "archived" && post.first_published_at ? "Republish this article to the public website?" : "Publish this article to the public website?")}>{publishLabel}</button> : null}
          {(post.status === "published" || (post.status === "archived" && post.first_published_at)) ? <a className="admin-button admin-button-secondary" href={publicUrl} target="_blank" rel="noopener noreferrer">{post.status === "published" ? "View public article" : "View archived public URL"}</a> : null}
          {post.status !== "archived" ? <button className="admin-button admin-button-danger" type="button" disabled={pending} onClick={() => void lifecycleAction("archive", "Archive this article? Its previously published URL will be preserved.")}>Archive</button> : null}
        </div>
        {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
        {message ? <p className="admin-form-success" role="status">{message}</p> : null}
      </section>

      <section className="admin-card admin-blog-section" aria-labelledby="history-heading">
        <h2 id="history-heading">Revision history</h2>
        <p className="admin-help">Previous snapshots are recorded automatically and are read-only in this CMS.</p>
        {revisions.length ? <div className="admin-timeline">{revisions.map((revision) => (
          <div className="admin-timeline-item" key={revision.id}>
            <div className="admin-timeline-meta">{formatAdminDate(revision.created_at)} · {formatAdminLabel(revision.change_type)} · {revision.changed_by ? `Administrator ${revision.changed_by.slice(0, 8)}` : "System"}</div>
            <p><strong>{revision.title}</strong><br />Previous status: {formatAdminLabel(revision.status)} · Previous slug: <span className="admin-code">{revision.slug}</span></p>
          </div>
        ))}</div> : <p className="admin-muted">No revisions recorded yet.</p>}
      </section>
    </form>
  );
}
