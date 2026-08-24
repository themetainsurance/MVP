import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteFooter from "../../components/SiteFooter";
import {
  getBlogImagePublicUrl,
  loadPublicBlogPostBySlug,
} from "../../lib/blog-public-data";
import { isValidBlogSlug } from "../../lib/blog-validation";
import BlogArticleView from "../components/BlogArticleView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = "https://www.themetainsurance.com";

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidBlogSlug(slug)) {
    return { robots: { index: false, follow: false } };
  }

  const post = await loadPublicBlogPostBySlug(slug);
  if (!post) return { robots: { index: false, follow: false } };

  const title = post.seo_title ?? post.title;
  const description = post.meta_description ?? "";
  const canonical = `/blog/${post.slug}`;
  const imageUrl = getBlogImagePublicUrl(post.featured_image_path);
  const images =
    imageUrl && post.featured_image_alt
      ? [{ url: imageUrl, alt: post.featured_image_alt }]
      : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots:
      post.status === "archived"
        ? { index: false, follow: true }
        : { index: true, follow: true },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: post.first_published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author_name ? [post.author_name] : undefined,
      images,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function CmsBlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  if (!isValidBlogSlug(slug)) notFound();

  const post = await loadPublicBlogPostBySlug(slug);
  if (!post) notFound();

  const imageUrl = getBlogImagePublicUrl(post.featured_image_path);
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const structuredData =
    post.status === "published"
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.meta_description,
          url: canonicalUrl,
          datePublished: post.first_published_at ?? undefined,
          dateModified: post.updated_at,
          image: imageUrl ?? undefined,
          author: post.author_name
            ? { "@type": "Person", name: post.author_name }
            : undefined,
          publisher: {
            "@type": "Organization",
            name: "The Meta Insurance",
          },
        }
      : null;

  return (
    <main>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <BlogArticleView post={post} imageUrl={imageUrl} />
      <SiteFooter />
    </main>
  );
}
