import type { Metadata } from "next";
import SiteFooter from "../components/SiteFooter";
import {
  getBlogImagePublicUrl,
  loadPublishedBlogCards,
} from "../lib/blog-public-data";
import { LEGACY_BLOG_SLUGS } from "../lib/blog-types";

export const metadata: Metadata = {
  title: "Insurance Guides | The Meta Insurance",
  description:
    "Simple insurance guides about travel, motor and property insurance, policy comparison, coverage limits, deductibles, exclusions and renewals.",

  alternates: {
    canonical: "/blog",
  },

  openGraph: {
    title: "Insurance Guides | The Meta Insurance",
    description:
      "Simple insurance guides about travel, motor and property insurance, policy comparison, coverage limits, deductibles, exclusions and renewals.",
    url: "/blog",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Insurance Guides | The Meta Insurance",
    description:
      "Simple guides explaining travel, motor and property insurance, comparisons and renewals.",
  },
};

type Guide = {
  category: string;
  icon: string;
  title: string;
  description: string;
  href?: string;
};

const guides: Guide[] = [
  {
    category: "TRAVEL",
    icon: "✈️",
    title: "What Does Travel Insurance Cover?",
    description:
      "Understand common travel insurance coverage including medical expenses, cancellations, baggage and delays.",
    href: "/blog/travel-insurance-guide",
  },
  {
    category: "MOTOR",
    icon: "🚗",
    title: "How to Understand Motor Insurance Coverage",
    description:
      "Learn about common motor insurance coverage, deductibles, liability, vehicle damage and optional protection.",
    href: "/blog/motor-insurance-guide",
  },
  {
    category: "PROPERTY",
    icon: "🏠",
    title: "Property Insurance Explained Simply",
    description:
      "A simple introduction to building cover, contents insurance, liability, deductibles and common exclusions.",
    href: "/blog/property-insurance-guide",
  },
  {
  category: "COMPARISON",
  icon: "⚖️",
  title: "How to Compare Insurance Policies",
  description:
    "Learn how to compare premiums, coverage limits, deductibles, exclusions and additional benefits.",
  href: "/blog/how-to-compare-insurance-policies",
},
  {
  category: "RENEWAL",
  icon: "🔄",
  title: "What to Check Before Renewing Your Insurance",
  description:
    "A practical checklist of information to review before renewing an existing insurance policy.",
  href: "/blog/insurance-renewal-checklist",
},
];

export default async function BlogPage() {
  const legacySlugs = new Set<string>(LEGACY_BLOG_SLUGS);
  const cmsPosts = (await loadPublishedBlogCards()).filter(
    (post) => !legacySlugs.has(post.slug)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          minHeight: "72px",
          padding: "0 7%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "30px",
          borderBottom: "1px solid #e5e7eb",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/"
          style={{
            color: "#0f172a",
            textDecoration: "none",
            fontSize: "22px",
            fontWeight: 800,
          }}
        >
          The Meta Insurance
        </a>

        <nav
          style={{
            display: "flex",
            gap: "22px",
            alignItems: "center",
            flexWrap: "wrap",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <a href="/travel" style={navStyle}>
            Travel
          </a>

          <a href="/motor" style={navStyle}>
            Motor
          </a>

          <a href="/property" style={navStyle}>
            Property
          </a>

          <a href="/ai-assistant" style={navStyle}>
            AI Assistant
          </a>

          <a
            href="/"
            style={{
              ...navStyle,
              color: "#0284c7",
            }}
          >
            ← Home
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #082f49 0%, #075985 55%, #0369a1 100%)",
          color: "#ffffff",
          padding: "80px 7%",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              color: "#bae6fd",
              fontWeight: 800,
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            INSURANCE KNOWLEDGE
          </div>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: "0 0 20px",
              maxWidth: "750px",
            }}
          >
            Insurance guides without the complicated language.
          </h1>

          <p
            style={{
              maxWidth: "680px",
              fontSize: "18px",
              lineHeight: 1.7,
              color: "#e0f2fe",
              margin: 0,
            }}
          >
            Learn how insurance coverage, premiums, deductibles, limits and
            exclusions work before submitting an insurance request.
          </p>
        </div>
      </section>

      {/* GUIDES */}
      <section
        style={{
          padding: "85px 7%",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                color: "#0284c7",
                fontSize: "13px",
                fontWeight: 800,
                marginBottom: "10px",
              }}
            >
              GUIDES & EXPLAINERS
            </div>

            <h2
              style={{
                fontSize: "36px",
                margin: 0,
              }}
            >
              Learn about insurance
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "22px",
            }}
          >
            {cmsPosts.map((post) => {
              const imageUrl = getBlogImagePublicUrl(post.featured_image_path);
              const publicationDate = post.published_at
                ? new Intl.DateTimeFormat("en", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(post.published_at))
                : null;

              return (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "30px",
                    textDecoration: "none",
                    color: "#0f172a",
                    display: "block",
                  }}
                >
                  {imageUrl && post.featured_image_alt ? (
                    <img
                      src={imageUrl}
                      alt={post.featured_image_alt}
                      width={640}
                      height={336}
                      loading="lazy"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "11px",
                        marginBottom: "22px",
                        background: "#e2e8f0",
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      color: "#0284c7",
                      fontSize: "11px",
                      fontWeight: 900,
                      marginBottom: "10px",
                      textTransform: "uppercase",
                    }}
                  >
                    {post.category}
                  </div>
                  <h2
                    style={{
                      fontSize: "21px",
                      lineHeight: 1.35,
                      margin: "0 0 14px",
                      color: "#0f172a",
                    }}
                  >
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: 1.65,
                        marginBottom: "20px",
                      }}
                    >
                      {post.excerpt}
                    </p>
                  ) : null}
                  {publicationDate ? (
                    <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "12px" }}>
                      Published {publicationDate}
                    </div>
                  ) : null}
                  <div style={{ color: "#0284c7", fontWeight: 800, fontSize: "14px" }}>
                    Read guide →
                  </div>
                </a>
              );
            })}
            {guides.map((guide) =>
              guide.href ? (
                <a
                  key={guide.title}
                  href={guide.href}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "30px",
                    textDecoration: "none",
                    color: "#0f172a",
                    display: "block",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "34px",
                      marginBottom: "20px",
                    }}
                  >
                    {guide.icon}
                  </div>

                  <div
                    style={{
                      color: "#0284c7",
                      fontSize: "11px",
                      fontWeight: 900,
                      marginBottom: "10px",
                    }}
                  >
                    {guide.category}
                  </div>

                  <h2
                    style={{
                      fontSize: "21px",
                      lineHeight: 1.35,
                      margin: "0 0 14px",
                      color: "#0f172a",
                    }}
                  >
                    {guide.title}
                  </h2>

                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: 1.65,
                      marginBottom: "24px",
                    }}
                  >
                    {guide.description}
                  </p>

                  <div
                    style={{
                      color: "#0284c7",
                      fontWeight: 800,
                      fontSize: "14px",
                    }}
                  >
                    Read guide →
                  </div>
                </a>
              ) : (
                <article
                  key={guide.title}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "30px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "34px",
                      marginBottom: "20px",
                    }}
                  >
                    {guide.icon}
                  </div>

                  <div
                    style={{
                      color: "#0284c7",
                      fontSize: "11px",
                      fontWeight: 900,
                      marginBottom: "10px",
                    }}
                  >
                    {guide.category}
                  </div>

                  <h2
                    style={{
                      fontSize: "21px",
                      lineHeight: 1.35,
                      margin: "0 0 14px",
                    }}
                  >
                    {guide.title}
                  </h2>

                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: 1.65,
                      marginBottom: "24px",
                    }}
                  >
                    {guide.description}
                  </p>

                  <div
                    style={{
                      color: "#94a3b8",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    Guide coming next
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section
        style={{
          padding: "0 7% 70px",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "14px",
            padding: "22px",
            color: "#92400e",
            lineHeight: 1.7,
            fontSize: "14px",
          }}
        >
          <strong>Important:</strong> The information in our guides is provided
          for general educational purposes and does not constitute regulated
          insurance advice or a recommendation to purchase a particular
          insurance product. The Meta Insurance is an independent insurance
          discovery and referral platform. Licensed insurance partners
          determine eligibility, pricing, coverage and final terms.
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "70px 7%",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              marginBottom: "15px",
            }}
          >
            Ready to start an insurance request?
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "17px",
              lineHeight: 1.6,
              marginBottom: "28px",
            }}
          >
            Choose an insurance category or use our assistant to provide the
            information step by step.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <a href="/travel" style={buttonStyle}>
              ✈️ Travel
            </a>

            <a href="/motor" style={buttonStyle}>
              🚗 Motor
            </a>

            <a href="/property" style={buttonStyle}>
              🏠 Property
            </a>

            <a
              href="/ai-assistant"
              style={{
                ...buttonStyle,
                background: "#0f172a",
              }}
            >
              Ask AI Assistant →
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

const navStyle = {
  color: "#0f172a",
  textDecoration: "none",
};

const buttonStyle = {
  background: "#0284c7",
  color: "#ffffff",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: "9px",
  fontWeight: 800,
  fontSize: "14px",
};
