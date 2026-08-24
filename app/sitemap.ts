import type { MetadataRoute } from "next";
import { loadPublishedBlogSitemapEntries } from "./lib/blog-public-data";
import { LEGACY_BLOG_SLUGS } from "./lib/blog-types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.themetainsurance.com";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/travel`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/motor`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/property`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-assistant`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/travel-insurance-guide`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/motor-insurance-guide`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/property-insurance-guide`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-compare-insurance-policies`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/insurance-renewal-checklist`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/affiliate-disclosure`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const legacySlugs = new Set<string>(LEGACY_BLOG_SLUGS);
  const cmsEntries = (await loadPublishedBlogSitemapEntries())
    .filter((entry) => !legacySlugs.has(entry.slug))
    .map((entry) => ({
      url: `${baseUrl}/blog/${entry.slug}`,
      lastModified: entry.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticEntries, ...cmsEntries];
}
