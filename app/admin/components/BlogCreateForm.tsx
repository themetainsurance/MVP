"use client";

import { useState, type FormEvent } from "react";
import { BLOG_CATEGORIES } from "../../lib/blog-types";
import { generateBlogSlug } from "../../lib/blog-validation";
import { formatAdminLabel } from "./AdminUi";

export default function BlogCreateForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("general");
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          category,
          author_name: authorName,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success || typeof result.postId !== "string") {
        if (response.status === 401) {
          window.location.assign("/admin/login");
          return;
        }
        setError(result?.error || "Operation could not be completed.");
        return;
      }
      window.location.assign(`/admin/blog/${result.postId}`);
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={submit} noValidate>
      <label htmlFor="blog-title">
        Title
        <input
          id="blog-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={180}
          autoFocus
        />
      </label>

      <label htmlFor="blog-slug">
        Slug
        <input
          id="blog-slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
          minLength={3}
          maxLength={160}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby="blog-slug-help"
        />
      </label>
      <p className="admin-help" id="blog-slug-help">
        Lowercase ASCII letters, numbers and hyphens only. The slug will become
        permanent after first publication.
      </p>
      <button
        className="admin-button admin-button-secondary"
        type="button"
        onClick={() => setSlug(generateBlogSlug(title))}
        disabled={!title.trim()}
      >
        Generate from title
      </button>

      <label htmlFor="blog-category">
        Category
        <select
          id="blog-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {BLOG_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {formatAdminLabel(value)}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="blog-author">
        Author / display name (optional)
        <input
          id="blog-author"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          maxLength={120}
        />
      </label>

      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <button
        className="admin-button admin-button-primary"
        type="submit"
        disabled={pending}
      >
        {pending ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
