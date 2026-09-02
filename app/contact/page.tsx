import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import BrandLogo from "../components/BrandLogo";
import SiteFooter from "../components/SiteFooter";

const siteName = "The Meta Insurance";
const contactEmail = "contact@themetainsurance.com";
const emailHref = `mailto:${contactEmail}`;
const pageTitle = "Contact | The Meta Insurance";
const pageDescription =
  "Contact The Meta Insurance about the platform, privacy, partnerships, referrals or an existing insurance request.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    url: "/contact",
    title: pageTitle,
    description: pageDescription,
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: pageDescription,
  },
};

const navigation = [
  { href: "/travel", label: "Travel" },
  { href: "/motor", label: "Motor" },
  { href: "/property", label: "Property" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/blog", label: "Blog" },
];

const enquiryCategories = [
  {
    title: "General questions",
    description: "Questions about The Meta Insurance and how the platform works.",
  },
  {
    title: "Existing insurance requests",
    description: "Help identifying or following up on a submitted request.",
  },
  {
    title: "Technical problems",
    description: "Website, form, AI Assistant Lite or upload-feature issues.",
  },
  {
    title: "Privacy requests",
    description: "Personal data questions and requests under applicable law.",
  },
  {
    title: "Policy document questions",
    description: "Questions about Motor, Property or Health policy document uploads.",
  },
  {
    title: "Affiliate and partnership enquiries",
    description: "Commercial, referral, affiliate or technology opportunities.",
  },
  {
    title: "Licensed partner enquiries",
    description: "Enquiries from licensed insurers, brokers or intermediaries.",
  },
  {
    title: "Platform feedback",
    description: "Feedback about content, accessibility or the user experience.",
  },
];

const contents = [
  ["enquiries", "What you can contact us about"],
  ["existing-requests", "Existing insurance requests"],
  ["insurance-questions", "Insurance-related questions"],
  ["documents", "Policy document security"],
  ["privacy-requests", "Privacy and personal data requests"],
  ["partnerships", "Affiliate and partnership enquiries"],
  ["responses", "Response expectations"],
  ["legal", "Platform role and legal pages"],
] as const;

export default function ContactPage() {
  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <a href="/" style={brandStyle}>
          <BrandLogo />
        </a>

        <nav aria-label="Primary navigation" style={navStyle}>
          {navigation.map((item) => (
            <a key={item.href} href={item.href} style={navLinkStyle}>
              {item.label}
            </a>
          ))}

          <a href="/" style={{ ...navLinkStyle, color: "#0284c7" }}>
            &larr; Home
          </a>
        </nav>
      </header>

      <section style={heroStyle}>
        <div style={wideContainerStyle}>
          <div style={eyebrowStyle}>CONTACT</div>

          <h1 style={heroTitleStyle}>Contact The Meta Insurance</h1>

          <p style={heroTextStyle}>
            For questions about The Meta Insurance platform, partnerships,
            referrals, privacy or an existing request, contact us here.
          </p>
        </div>
      </section>

      <section style={contentBackgroundStyle}>
        <div style={contentContainerStyle}>
          <aside aria-label="Primary contact method" style={contactCardStyle}>
            <div style={contactCardLabelStyle}>PRIMARY CONTACT</div>
            <h2 style={contactCardTitleStyle}>Email The Meta Insurance</h2>
            <p style={contactCardTextStyle}>
              For all current enquiry categories, email us at:
            </p>

            <a href={emailHref} style={emailAddressStyle}>
              {contactEmail}
            </a>

            <a
              href={emailHref}
              aria-label={`Email The Meta Insurance at ${contactEmail}`}
              style={emailButtonStyle}
            >
              Email The Meta Insurance
            </a>

            <p style={responseNoteStyle}>
              We aim to review enquiries as reasonably practicable, but response
              times may vary depending on the nature of the request.
            </p>
          </aside>

          <nav aria-label="Contact page contents" style={contentsCardStyle}>
            <div style={sectionLabelStyle}>ON THIS PAGE</div>
            <div style={contentsGridStyle}>
              {contents.map(([href, label], index) => (
                <a key={href} href={`#${href}`} style={contentsLinkStyle}>
                  <span style={contentsNumberStyle}>{index + 1}</span>
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <ContactSection id="enquiries" number="01" title="What you can contact us about">
            <p style={paragraphStyle}>
              Use the verified contact email for any of the following enquiry
              categories. A concise subject line and a short explanation will
              help us understand where to direct your message.
            </p>

            <div style={categoryGridStyle}>
              {enquiryCategories.map((category) => (
                <div key={category.title} style={categoryCardStyle}>
                  <h3 style={categoryTitleStyle}>{category.title}</h3>
                  <p style={categoryTextStyle}>{category.description}</p>
                </div>
              ))}
            </div>
          </ContactSection>

          <ContactSection id="existing-requests" number="02" title="Existing insurance requests">
            <p style={paragraphStyle}>
              If your enquiry concerns an existing request, it may help to
              include the following information so the request can be located:
            </p>

            <BulletList
              items={[
                "your full name;",
                "the email address used for the request;",
                "the insurance type: Travel, Motor, Property or Health; and",
                "the approximate date the request was submitted.",
              ]}
            />

            <SecurityNotice>
              Do not send passwords, payment card details, authentication codes
              or unnecessary sensitive personal information by email. We will
              ask for additional information only where it is reasonably needed
              to understand or handle the enquiry.
            </SecurityNotice>
          </ContactSection>

          <ContactSection id="insurance-questions" number="03" title="Insurance-related questions">
            <Callout>
              <strong>The Meta Insurance cannot provide regulated insurance
              advice through the Contact page or contact email.</strong>
            </Callout>

            <p style={paragraphStyle}>
              Questions relating to insurance eligibility, underwriting, final
              premiums, final coverage, policy issuance, claims or regulated
              recommendations may need to be handled by the relevant licensed
              insurance partner. The partner may need to verify your identity or
              request additional information under its own processes.
            </p>

            <p style={paragraphStyle}>
              The Meta Insurance can help with general platform questions and
              request-routing issues, but cannot override a partner&apos;s decision,
              amend an insurance contract, bind coverage or make a final
              recommendation.
            </p>
          </ContactSection>

          <ContactSection id="documents" number="04" title="Policy document security">
            <SecurityNotice>
              Do not email unnecessary sensitive policy documents or identity
              documents unless they are specifically requested for a legitimate
              purpose. Email is not the preferred route for sending an existing
              Motor, Property or Health policy through the platform.
            </SecurityNotice>

            <p style={paragraphStyle}>
              Where applicable, use the secure policy upload functionality on
              the relevant request page. Upload only documents that you are
              authorised to provide and remove information that is not needed
              where practical.
            </p>

            <div style={actionLinksStyle}>
              <a href="/motor" style={secondaryButtonStyle}>
                Motor policy upload
              </a>
              <a href="/property" style={secondaryButtonStyle}>
                Property policy upload
              </a>
            </div>
          </ContactSection>

          <ContactSection id="privacy-requests" number="05" title="Privacy and personal data requests">
            <p style={paragraphStyle}>
              Privacy-related questions and requests can be sent to{" "}
              <a href={emailHref} style={inlineEmailStyle}>
                {contactEmail}
              </a>
              . Depending on applicable law and the circumstances, this may
              include:
            </p>

            <BulletList
              items={[
                "a request to access personal information;",
                "a request to correct inaccurate or incomplete information;",
                "a request to delete personal information;",
                "a general privacy or personal data question; or",
                "withdrawal of consent for future processing where applicable.",
              ]}
            />

            <p style={paragraphStyle}>
              Privacy rights depend on the law that applies and may be subject
              to identity verification, legal exceptions or separate processing
              by a licensed insurance partner. Read the{" "}
              <a href="/privacy" style={inlineLinkStyle}>
                Privacy Policy
              </a>{" "}
              for more information.
            </p>
          </ContactSection>

          <ContactSection id="partnerships" number="06" title="Affiliate and partnership enquiries">
            <p style={paragraphStyle}>
              Licensed insurers, licensed brokers or intermediaries, affiliate
              partners, referral partners and technology partners may send an
              introductory enquiry to{" "}
              <a href={emailHref} style={inlineEmailStyle}>
                {contactEmail}
              </a>
              .
            </p>

            <p style={paragraphStyle}>
              Please describe the organisation, the nature of the proposed
              relationship and a suitable contact person. Sending an enquiry
              does not guarantee that a partnership, integration, referral
              arrangement or other commercial relationship is available or will
              be accepted.
            </p>
          </ContactSection>

          <ContactSection id="responses" number="07" title="Response expectations">
            <p style={paragraphStyle}>
              We aim to review enquiries as reasonably practicable, but response
              times may vary depending on the nature and complexity of the
              request, whether additional details are needed, and whether a
              licensed insurance partner must be involved.
            </p>

            <p style={paragraphStyle}>
              Email delivery does not guarantee that an insurance request has
              been accepted or that coverage is active. For time-sensitive
              policy, payment, coverage or claims matters, follow the official
              instructions provided by the relevant licensed insurance partner.
            </p>
          </ContactSection>

          <ContactSection id="legal" number="08" title="Platform role and related legal pages">
            <Callout tone="blue">
              <strong>The Meta Insurance is an independent insurance discovery
              and referral platform, not an insurer or licensed insurance
              broker.</strong> We do not service active policies or claims.
              Eligibility, underwriting, pricing, policy issuance and final
              terms are handled by relevant licensed insurance partners.
            </Callout>

            <div style={legalLinksGridStyle}>
              <LegalLink
                href="/privacy"
                title="Privacy Policy"
                description="How personal information and privacy requests are handled."
              />
              <LegalLink
                href="/terms"
                title="Terms & Conditions"
                description="The rules that apply when using the platform."
              />
              <LegalLink
                href="/affiliate-disclosure"
                title="Affiliate Disclosure"
                description="How referral and commercial partner relationships may work."
              />
            </div>
          </ContactSection>

          <aside style={finalContactStyle}>
            <div>
              <strong style={finalContactTitleStyle}>Still need to reach us?</strong>
              <span style={finalContactTextStyle}>{contactEmail}</span>
            </div>
            <a href={emailHref} style={finalContactButtonStyle}>
              Email The Meta Insurance
            </a>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function ContactSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} style={contactSectionStyle}>
      <div style={sectionNumberStyle}>{number}</div>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function Callout({
  children,
  tone = "amber",
}: {
  children: ReactNode;
  tone?: "amber" | "blue";
}) {
  const isBlue = tone === "blue";

  return (
    <div
      style={{
        ...calloutStyle,
        background: isBlue ? "#f0f9ff" : "#fffbeb",
        borderColor: isBlue ? "#bae6fd" : "#fde68a",
        color: isBlue ? "#0c4a6e" : "#78350f",
      }}
    >
      {children}
    </div>
  );
}

function SecurityNotice({ children }: { children: ReactNode }) {
  return (
    <div role="note" style={securityNoticeStyle}>
      <strong style={{ display: "block", marginBottom: "6px" }}>
        Security reminder
      </strong>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={listStyle}>
      {items.map((item) => (
        <li key={item} style={listItemStyle}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function LegalLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a href={href} style={legalLinkCardStyle}>
      <span style={legalLinkLabelStyle}>LEGAL &amp; TRUST</span>
      <strong style={legalLinkTitleStyle}>{title}</strong>
      <span style={legalLinkTextStyle}>{description}</span>
    </a>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  margin: 0,
  background: "#ffffff",
  color: "#0f172a",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const headerStyle: CSSProperties = {
  minHeight: "72px",
  padding: "0 7%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "30px",
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff",
  flexWrap: "wrap",
};

const brandStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: 800,
  letterSpacing: "-0.5px",
};

const navStyle: CSSProperties = {
  display: "flex",
  gap: "22px",
  alignItems: "center",
  flexWrap: "wrap",
  fontSize: "14px",
  fontWeight: 700,
};

const navLinkStyle: CSSProperties = {
  color: "#334155",
  textDecoration: "none",
};

const heroStyle: CSSProperties = {
  padding: "78px 7% 82px",
  color: "#ffffff",
  background:
    "linear-gradient(135deg, #082f49 0%, #075985 55%, #0369a1 100%)",
};

const wideContainerStyle: CSSProperties = {
  maxWidth: "1180px",
  margin: "0 auto",
};

const eyebrowStyle: CSSProperties = {
  marginBottom: "16px",
  color: "#bae6fd",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.08em",
};

const heroTitleStyle: CSSProperties = {
  maxWidth: "800px",
  margin: "0 0 20px",
  fontSize: "clamp(42px, 6vw, 58px)",
  lineHeight: 1.05,
  letterSpacing: "-1.8px",
};

const heroTextStyle: CSSProperties = {
  maxWidth: "760px",
  margin: 0,
  color: "#e0f2fe",
  fontSize: "18px",
  lineHeight: 1.7,
};

const contentBackgroundStyle: CSSProperties = {
  padding: "64px 7% 90px",
  background: "#f8fafc",
};

const contentContainerStyle: CSSProperties = {
  maxWidth: "940px",
  margin: "0 auto",
};

const contactCardStyle: CSSProperties = {
  marginBottom: "24px",
  padding: "clamp(28px, 6vw, 46px)",
  border: "2px solid #0284c7",
  borderRadius: "18px",
  background: "#ffffff",
  boxShadow: "0 18px 46px rgba(2, 132, 199, 0.14)",
  textAlign: "center",
};

const contactCardLabelStyle: CSSProperties = {
  marginBottom: "10px",
  color: "#0284c7",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.09em",
};

const contactCardTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  color: "#0f172a",
  fontSize: "clamp(27px, 5vw, 38px)",
  letterSpacing: "-0.7px",
};

const contactCardTextStyle: CSSProperties = {
  margin: "0 0 12px",
  color: "#475569",
  fontSize: "16px",
  lineHeight: 1.7,
};

const emailAddressStyle: CSSProperties = {
  display: "block",
  width: "fit-content",
  maxWidth: "100%",
  margin: "0 auto 24px",
  color: "#0369a1",
  fontSize: "clamp(20px, 4vw, 28px)",
  fontWeight: 800,
  overflowWrap: "anywhere",
};

const emailButtonStyle: CSSProperties = {
  display: "inline-flex",
  minHeight: "50px",
  padding: "0 24px",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  background: "#0284c7",
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: 800,
};

const responseNoteStyle: CSSProperties = {
  maxWidth: "650px",
  margin: "22px auto 0",
  color: "#64748b",
  fontSize: "13px",
  lineHeight: 1.65,
};

const contentsCardStyle: CSSProperties = {
  marginBottom: "26px",
  padding: "28px",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  background: "#ffffff",
};

const sectionLabelStyle: CSSProperties = {
  marginBottom: "18px",
  color: "#0284c7",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.08em",
};

const contentsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "10px 28px",
};

const contentsLinkStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "baseline",
  padding: "5px 0",
  color: "#334155",
  textDecoration: "none",
  fontSize: "14px",
  lineHeight: 1.5,
};

const contentsNumberStyle: CSSProperties = {
  minWidth: "20px",
  color: "#0284c7",
  fontSize: "12px",
  fontWeight: 800,
};

const contactSectionStyle: CSSProperties = {
  marginBottom: "24px",
  padding: "clamp(26px, 5vw, 42px)",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  background: "#ffffff",
};

const sectionNumberStyle: CSSProperties = {
  marginBottom: "10px",
  color: "#0284c7",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.08em",
};

const sectionTitleStyle: CSSProperties = {
  margin: "0 0 20px",
  color: "#0f172a",
  fontSize: "clamp(25px, 4vw, 32px)",
  lineHeight: 1.2,
  letterSpacing: "-0.6px",
};

const paragraphStyle: CSSProperties = {
  margin: "0 0 18px",
  color: "#475569",
  fontSize: "16px",
  lineHeight: 1.78,
};

const categoryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
  marginTop: "24px",
};

const categoryCardStyle: CSSProperties = {
  padding: "20px",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  background: "#f8fafc",
};

const categoryTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "#0f172a",
  fontSize: "16px",
  lineHeight: 1.4,
};

const categoryTextStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
  lineHeight: 1.6,
};

const calloutStyle: CSSProperties = {
  margin: "22px 0",
  padding: "20px 22px",
  border: "1px solid",
  borderRadius: "13px",
  fontSize: "15px",
  lineHeight: 1.75,
};

const securityNoticeStyle: CSSProperties = {
  margin: "22px 0",
  padding: "20px 22px",
  border: "1px solid #fecaca",
  borderRadius: "13px",
  background: "#fef2f2",
  color: "#7f1d1d",
  fontSize: "15px",
  lineHeight: 1.75,
};

const listStyle: CSSProperties = {
  margin: "0 0 20px",
  paddingLeft: "24px",
  color: "#475569",
};

const listItemStyle: CSSProperties = {
  marginBottom: "9px",
  paddingLeft: "4px",
  fontSize: "16px",
  lineHeight: 1.7,
};

const actionLinksStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "22px",
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  minHeight: "46px",
  padding: "0 19px",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #0284c7",
  borderRadius: "9px",
  color: "#0369a1",
  background: "#f0f9ff",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 800,
};

const inlineEmailStyle: CSSProperties = {
  color: "#0369a1",
  fontWeight: 800,
  overflowWrap: "anywhere",
};

const inlineLinkStyle: CSSProperties = {
  color: "#0284c7",
  fontWeight: 700,
};

const legalLinksGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
  marginTop: "24px",
};

const legalLinkCardStyle: CSSProperties = {
  display: "block",
  padding: "21px",
  border: "1px solid #bae6fd",
  borderRadius: "13px",
  background: "#f0f9ff",
  color: "#0f172a",
  textDecoration: "none",
};

const legalLinkLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: "9px",
  color: "#0284c7",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.08em",
};

const legalLinkTitleStyle: CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "17px",
};

const legalLinkTextStyle: CSSProperties = {
  color: "#475569",
  fontSize: "13px",
  lineHeight: 1.6,
};

const finalContactStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap",
  padding: "26px",
  border: "1px solid #bae6fd",
  borderRadius: "14px",
  background: "#e0f2fe",
};

const finalContactTitleStyle: CSSProperties = {
  display: "block",
  marginBottom: "6px",
  color: "#0c4a6e",
  fontSize: "18px",
};

const finalContactTextStyle: CSSProperties = {
  display: "block",
  color: "#075985",
  fontSize: "14px",
  overflowWrap: "anywhere",
};

const finalContactButtonStyle: CSSProperties = {
  display: "inline-flex",
  minHeight: "46px",
  padding: "0 20px",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9px",
  background: "#0369a1",
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 800,
};
