import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Meta Insurance | Travel, Motor & Property Insurance",
  description:
    "Compare travel, motor and property insurance, understand coverage differences and submit your insurance request to relevant licensed insurance partners.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Meta Insurance | Travel, Motor & Property Insurance",
    description:
      "Compare travel, motor and property insurance, understand coverage differences and submit your insurance request to relevant licensed insurance partners.",
    url: "/",
    type: "website",
  },
};

const insuranceTypes = [
  {
    icon: "✈️",
    title: "Travel Insurance",
    description:
      "Compare travel insurance for single trips, multiple trips and worldwide cover.",
    href: "/travel",
  },
  {
    icon: "🚗",
    title: "Motor Insurance",
    description:
      "Find motor insurance based on your vehicle and coverage requirements.",
    href: "/motor",
  },
  {
    icon: "🏠",
    title: "Property Insurance",
    description:
      "Protect your home, apartment or property with the right level of cover.",
    href: "/property",
  },
];

export default function Home() {
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
          background: "#ffffff",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/"
          style={{
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            textDecoration: "none",
            color: "#0f172a",
          }}
        >
          The Meta Insurance
        </a>

        <nav
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
            fontSize: "14px",
            fontWeight: 600,
            flexWrap: "wrap",
          }}
        >
          <NavLink href="#insurance">
            Insurance
          </NavLink>

          <NavLink href="#how-it-works">
            How it works
          </NavLink>

          <NavLink href="/blog">
            Blog
          </NavLink>

          <NavLink href="/ai-assistant">
            AI Assistant
          </NavLink>

          <a
            href="#insurance"
            style={{
              textDecoration: "none",
              border: "none",
              background: "#0f172a",
              color: "white",
              padding: "11px 18px",
              borderRadius: "9px",
              fontWeight: 700,
            }}
          >
            Get insured
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #082f49 0%, #075985 55%, #0369a1 100%)",
          padding: "75px 7% 90px",
          color: "white",
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
              maxWidth: "720px",
              marginBottom: "45px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "18px",
                color: "#bae6fd",
              }}
            >
              SMARTER INSURANCE STARTS HERE
            </div>

            <h1
              style={{
                fontSize: "56px",
                lineHeight: 1.05,
                margin: "0 0 20px",
                letterSpacing: "-2px",
              }}
            >
              Find the right insurance.
              <br />
              Without the complexity.
            </h1>

            <p
              style={{
                fontSize: "19px",
                lineHeight: 1.6,
                color: "#e0f2fe",
                maxWidth: "650px",
              }}
            >
              Compare insurance options, understand your coverage and submit
              your request to relevant licensed insurance partners.
            </p>
          </div>

          {/* QUICK START BOX */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "10px",
              maxWidth: "1050px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
                padding: "5px",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <InsuranceTab
                icon="✈️"
                title="Travel"
                href="/travel"
                active
              />

              <InsuranceTab
                icon="🚗"
                title="Motor"
                href="/motor"
              />

              <InsuranceTab
                icon="🏠"
                title="Property"
                href="/property"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "8px",
              }}
            >
              <SearchField
                label="Destination"
                value="Where are you going?"
              />

              <SearchField
                label="Start date"
                value="Select date"
              />

              <SearchField
                label="End date"
                value="Select date"
              />

              <a
                href="/travel"
                style={{
                  background: "#0284c7",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "56px",
                }}
              >
                Compare
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INSURANCE TYPES */}
      <section
        id="insurance"
        style={{
          padding: "90px 7%",
          background: "#f8fafc",
          scrollMarginTop: "80px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: "42px" }}>
            <div
              style={{
                color: "#0284c7",
                fontSize: "14px",
                fontWeight: 800,
                marginBottom: "10px",
              }}
            >
              INSURANCE MADE SIMPLE
            </div>

            <h2
              style={{
                fontSize: "38px",
                margin: 0,
                letterSpacing: "-1px",
              }}
            >
              What would you like to insure?
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            {insuranceTypes.map((insurance) => (
              <InsuranceCard
                key={insurance.title}
                icon={insurance.icon}
                title={insurance.title}
                description={insurance.description}
                href={insurance.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        style={{
          padding: "95px 7%",
          scrollMarginTop: "80px",
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
              textAlign: "center",
              marginBottom: "55px",
            }}
          >
            <h2
              style={{
                fontSize: "38px",
                marginBottom: "12px",
              }}
            >
              Insurance in three simple steps
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "17px",
              }}
            >
              A simple way to submit your insurance requirements.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "40px",
            }}
          >
            <Step
              number="01"
              title="Tell us what you need"
              description="Enter your insurance requirements manually, use our assistant, or upload an existing policy where available."
            />

            <Step
              number="02"
              title="Review the options"
              description="Compare factual differences in price, coverage, limits, deductibles and exclusions."
            />

            <Step
              number="03"
              title="Continue with a licensed partner"
              description="Insurance offers, regulated advice and final recommendations are provided by licensed insurance partners."
            />
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section
        id="ai-assistant"
        style={{
          padding: "40px 7% 100px",
          scrollMarginTop: "80px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            background: "#0f172a",
            borderRadius: "24px",
            padding: "60px",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "50px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <div
              style={{
                color: "#7dd3fc",
                fontWeight: 800,
                fontSize: "13px",
                marginBottom: "15px",
              }}
            >
              AI INSURANCE ASSISTANT
            </div>

            <h2
              style={{
                fontSize: "38px",
                margin: "0 0 18px",
              }}
            >
              Not sure where to start?
            </h2>

            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.7,
                fontSize: "17px",
              }}
            >
              Use our assistant to answer a few simple questions instead of
              completing the full insurance form manually. It will collect the
              information needed to submit your request to relevant licensed
              insurance partners.
            </p>
          </div>

          <a
            href="/ai-assistant"
            style={{
              background: "#ffffff",
              color: "#0f172a",
              padding: "16px 24px",
              borderRadius: "10px",
              fontWeight: 800,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Ask AI Assistant →
          </a>
        </div>
      </section>

      {/* BLOG */}
      <section
        id="blog"
        style={{
          padding: "80px 7%",
          background: "#f8fafc",
          scrollMarginTop: "80px",
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
              display: "flex",
              justifyContent: "space-between",
              gap: "25px",
              alignItems: "flex-end",
              flexWrap: "wrap",
              marginBottom: "35px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#0284c7",
                  fontSize: "13px",
                  fontWeight: 800,
                  marginBottom: "8px",
                }}
              >
                LEARN ABOUT INSURANCE
              </div>

              <h2
                style={{
                  fontSize: "36px",
                  margin: 0,
                }}
              >
                Insurance guides
              </h2>
            </div>

            <a
              href="/blog"
              style={{
                color: "#0284c7",
                fontSize: "14px",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              View all insurance guides →
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            <BlogCard
              category="TRAVEL"
              title="What does travel insurance actually cover?"
              href="/blog/travel-insurance-guide"
            />

            <BlogCard
              category="MOTOR"
              title="How to understand motor insurance coverage"
              href="/blog/motor-insurance-guide"
            />

            <BlogCard
              category="PROPERTY"
              title="Property insurance explained simply"
              href="/blog/property-insurance-guide"
            />
          </div>
        </div>
      </section>

      {/* AFFILIATE DISCLOSURE */}
      <section
        style={{
          padding: "40px 7%",
          background: "#ffffff",
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
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          <strong>Important:</strong> The Meta Insurance is a technology and
          referral platform. We do not currently act as an insurance broker or
          insurer. Insurance products, regulated advice, eligibility decisions
          and final recommendations are provided by relevant licensed
          insurance partners.
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "45px 7%",
          background: "#020617",
          color: "#94a3b8",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong
              style={{
                color: "white",
                display: "block",
                marginBottom: "8px",
              }}
            >
              The Meta Insurance
            </strong>

            <span>Insurance made simpler.</span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <FooterLink href="/travel">
              Travel
            </FooterLink>

            <FooterLink href="/motor">
              Motor
            </FooterLink>

            <FooterLink href="/property">
              Property
            </FooterLink>

            <FooterLink href="/ai-assistant">
              AI Assistant
            </FooterLink>

            <FooterLink href="/blog">
              Blog
            </FooterLink>
          </div>
        </div>
      </footer>
    </main>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        color: "#0f172a",
        textDecoration: "none",
        fontWeight: 600,
      }}
    >
      {children}
    </a>
  );
}

function InsuranceTab({
  icon,
  title,
  href,
  active = false,
}: {
  icon: string;
  title: string;
  href: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      style={{
        border: "none",
        background: active ? "#e0f2fe" : "transparent",
        color: "#0f172a",
        padding: "12px 18px",
        borderRadius: "9px",
        fontWeight: 700,
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      {icon} {title}
    </a>
  );
}

function SearchField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        padding: "12px 15px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#0f172a",
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InsuranceCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "30px",
      }}
    >
      <div
        style={{
          fontSize: "35px",
          marginBottom: "22px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: "21px",
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.6,
          minHeight: "75px",
        }}
      >
        {description}
      </p>

      <a
        href={href}
        style={{
          color: "#0284c7",
          fontWeight: 800,
          textDecoration: "none",
        }}
      >
        Get started →
      </a>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div
        style={{
          color: "#0284c7",
          fontSize: "14px",
          fontWeight: 900,
          marginBottom: "15px",
        }}
      >
        {number}
      </div>

      <h3 style={{ fontSize: "21px" }}>
        {title}
      </h3>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function BlogCard({
  category,
  title,
  href,
}: {
  category: string;
  title: string;
  href: string;
}) {
  return (
    <a
      href={href}
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "15px",
        padding: "28px",
        textDecoration: "none",
        color: "#0f172a",
        display: "block",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          color: "#0284c7",
          fontWeight: 800,
          fontSize: "12px",
          marginBottom: "18px",
        }}
      >
        {category}
      </div>

      <h3
        style={{
          fontSize: "20px",
          lineHeight: 1.4,
          color: "#0f172a",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          marginTop: "25px",
          fontWeight: 800,
          color: "#0284c7",
        }}
      >
        Read guide →
      </div>
    </a>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        color: "#94a3b8",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}
