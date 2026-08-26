import type { BlogPost } from "../../lib/blog-types";
import BlogMarkdown from "./BlogMarkdown";
import styles from "../blog-cms.module.css";

function formatPublicDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function BlogArticleView({
  post,
  imageUrl,
  preview = false,
}: {
  post: BlogPost;
  imageUrl: string | null;
  preview?: boolean;
}) {
  const publishedDate = formatPublicDate(
    post.first_published_at ?? post.published_at
  );
  const updatedDate = formatPublicDate(post.updated_at);
  const archived = post.status === "archived";

  return (
    <div className={styles.articlePage}>
      <header className={styles.siteHeader}>
        <a className={styles.brand} href={preview ? `/admin/blog/${post.id}` : "/"}>
          The Meta Insurance
        </a>
        <nav className={styles.siteNav} aria-label="Article navigation">
          {preview ? (
            <a href={`/admin/blog/${post.id}`}>Back to editor</a>
          ) : (
            <>
              <a href="/blog">Insurance Guides</a>
              <a href="/ai-assistant">AI Assistant</a>
              <a className={styles.homeLink} href="/">Home</a>
            </>
          )}
        </nav>
      </header>

      <article>
        <header className={styles.articleHero}>
          <div className={styles.articleHeroInner}>
            <p className={styles.category}>{post.category} insurance guide</p>
            <h1>{post.title}</h1>
            {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
            <div className={styles.articleMeta}>
              {post.author_name ? <span>By {post.author_name}</span> : null}
              {publishedDate ? (
                <span>
                  Published <time dateTime={post.first_published_at ?? post.published_at ?? undefined}>{publishedDate}</time>
                </span>
              ) : null}
              {updatedDate ? (
                <span>
                  Updated <time dateTime={post.updated_at}>{updatedDate}</time>
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <div className={styles.articleBody}>
          {archived ? (
            <div className={styles.archivedNotice} role="note">
              This article has been archived and may no longer reflect current
              products or market conditions.
            </div>
          ) : null}

          {imageUrl && post.featured_image_alt ? (
            <img
              className={styles.featuredImage}
              src={imageUrl}
              alt={post.featured_image_alt}
              width={1200}
              height={630}
              loading="eager"
            />
          ) : null}

          <BlogMarkdown markdown={post.body_markdown} />

          <div className={styles.educationalNotice} role="note">
            <strong>Important:</strong> This article is for general educational
            purposes and does not constitute regulated insurance advice or a
            recommendation to purchase a particular product. The Meta Insurance
            is an independent insurance discovery and referral platform.
            Licensed insurance partners determine eligibility, pricing,
            coverage, regulated advice and final terms.
          </div>
        </div>
      </article>
    </div>
  );
}
