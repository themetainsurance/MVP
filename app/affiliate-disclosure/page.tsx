import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import SiteFooter from "../components/SiteFooter";

const siteName = "The Meta Insurance";
const siteUrl = "https://www.themetainsurance.com";
const pageTitle = "Affiliate Disclosure | The Meta Insurance";
const pageDescription =
  "Learn how The Meta Insurance may receive referral, affiliate or other commercial compensation from participating insurance partners.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/affiliate-disclosure",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    url: "/affiliate-disclosure",
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

const contents = [
  ["model", "Platform business model"],
  ["compensation", "How compensation may arise"],
  ["pricing", "Insurance pricing and final terms"],
  ["comparisons", "Factual comparison information"],
  ["market", "Participating partner availability"],
  ["placements", "Rankings and sponsored positions"],
  ["partner-role", "Licensed partner responsibilities"],
  ["education", "Educational content"],
  ["referrals", "Affiliate links and referrals"],
  ["choice", "Your choice"],
  ["no-guarantee", "No guarantee from a referral"],
  ["conflicts", "Potential conflicts and transparency"],
  ["changes", "Changes to this disclosure"],
  ["contact", "Contact and legal pages"],
] as const;

export default function AffiliateDisclosurePage() {
  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <a href="/" style={brandStyle}>
          The Meta Insurance
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
          <div style={eyebrowStyle}>LEGAL &amp; TRUST</div>

          <h1 style={heroTitleStyle}>Affiliate Disclosure</h1>

          <p style={heroTextStyle}>
            This disclosure explains how commercial relationships with
            participating insurance partners may work and what those
            relationships mean for users of The Meta Insurance.
          </p>

          <p style={updatedStyle}>Last updated: 18 August 2026</p>
        </div>
      </section>

      <section style={contentBackgroundStyle}>
        <div style={contentContainerStyle}>
          <aside aria-label="Core affiliate disclosure" style={coreDisclosureStyle}>
            <div style={coreLabelStyle}>CORE DISCLOSURE</div>
            <strong style={coreStatementStyle}>
              The Meta Insurance may receive referral, affiliate or other
              commercial compensation from insurance partners when users are
              referred, submit qualifying requests, or complete certain actions
              with those partners.
            </strong>
            <p style={coreDetailStyle}>
              The Meta Insurance operates as a technology, information,
              referral and affiliate platform. It is not currently an insurer
              or a licensed insurance broker and does not provide regulated
              insurance advice, underwrite risk, bind insurance coverage or make
              final insurance recommendations.
            </p>
          </aside>

          <aside aria-label="Legal draft notice" style={draftNoticeStyle}>
            <strong style={{ display: "block", marginBottom: "6px" }}>
              MVP legal draft
            </strong>
            This Affiliate Disclosure is an MVP legal draft. It should be
            reviewed and adapted by a qualified legal professional before the
            platform&apos;s full commercial launch, including confirmation of
            actual partner arrangements, disclosures and applicable legal
            requirements.
          </aside>

          <nav aria-label="Affiliate Disclosure contents" style={contentsCardStyle}>
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

          <DisclosureSection id="model" number="01" title="Platform business model">
            <p style={paragraphStyle}>
              The Meta Insurance may work with licensed insurance companies,
              brokers, intermediaries or other authorised insurance partners
              through referral, affiliate, lead-generation or other commercial
              arrangements. The platform may collect and organise insurance
              request information, display available factual information and
              refer a user to a participating partner that may be able to handle
              the request.
            </p>

            <Callout>
              The Meta Insurance does not currently act as the insurer, licensed
              insurance broker or underwriter. It does not bind coverage, issue
              policies or provide a final insurance recommendation. A relevant
              licensed insurance partner is responsible for regulated and
              contractual insurance activities.
            </Callout>
          </DisclosureSection>

          <DisclosureSection id="compensation" number="02" title="How compensation may arise">
            <p style={paragraphStyle}>
              Depending on the commercial arrangement, The Meta Insurance may
              receive compensation when:
            </p>

            <BulletList
              items={[
                "a user is referred to a participating partner;",
                "a submitted lead or insurance request is accepted by a partner;",
                "a user clicks a partner link or continues to a partner's website or service;",
                "an insurance product is purchased, issued or activated after a referral; or",
                "another qualifying commercial event agreed with the partner occurs.",
              ]}
            />

            <p style={paragraphStyle}>
              The event that qualifies for compensation can vary by partner and
              arrangement. This disclosure does not state or imply a commission
              percentage, fixed fee, specific payment structure or partner name,
              because those details are not established in the current
              repository and may vary over time.
            </p>
          </DisclosureSection>

          <DisclosureSection id="pricing" number="03" title="Insurance pricing and final terms">
            <p style={paragraphStyle}>
              The relevant licensed insurance partner determines insurance
              premiums, pricing, underwriting decisions, payment terms,
              coverage, eligibility and final contractual terms. The Meta
              Insurance does not set or approve the final price or policy terms.
            </p>

            <Callout tone="blue">
              Commercial arrangements differ, so this disclosure does not claim
              that affiliate or referral compensation can never affect a
              user&apos;s price. Users should review and confirm the premium, fees,
              payment terms and all other final terms directly with the licensed
              insurance partner before purchasing or activating a product.
            </Callout>
          </DisclosureSection>

          <DisclosureSection id="comparisons" number="04" title="Factual comparison information">
            <p style={paragraphStyle}>
              A commercial relationship may exist with a partner whose
              information appears on the platform. Where factual comparison
              displays are available, they should present the information
              available for the policies or offers being compared, which may
              include:
            </p>

            <div style={comparisonGridStyle}>
              {[
                "Premium",
                "Coverage limits",
                "Deductibles",
                "Exclusions",
                "Included benefits",
                "Removed benefits",
                "Geographical coverage",
                "Special conditions",
              ].map((item) => (
                <div key={item} style={comparisonItemStyle}>
                  <span style={comparisonMarkerStyle}>+</span>
                  {item}
                </div>
              ))}
            </div>

            <p style={paragraphStyle}>
              A factual comparison describes available information and does not
              determine which policy is suitable for a user. It may depend on
              information supplied by users or partners and should be verified
              against the licensed partner&apos;s current official policy wording
              and final offer.
            </p>
          </DisclosureSection>

          <DisclosureSection id="market" number="05" title="Participating partner availability">
            <p style={paragraphStyle}>
              The platform may show, compare or refer users only to partners
              that participate in, are connected to, or are available through
              the platform for a particular request, product, location or time.
              It therefore does not necessarily represent every insurer,
              intermediary or insurance product available in the market.
            </p>

            <p style={paragraphStyle}>
              Partner participation and product availability may depend on
              insurance category, eligibility criteria, geography, underwriting
              appetite, technical integration and the partner&apos;s own commercial
              decisions. Users remain free to research insurance products and
              providers outside the platform.
            </p>
          </DisclosureSection>

          <DisclosureSection id="placements" number="06" title="Rankings, featured placements and sponsored positions">
            <p style={paragraphStyle}>
              The current MVP does not present insurance products as ranked
              solely by commission and does not claim to use a sophisticated
              independent ranking algorithm. The presence or order of
              information should not be treated as regulated advice, a personal
              recommendation or proof that a product is better or more suitable
              than another product.
            </p>

            <p style={paragraphStyle}>
              If rankings, featured placements, sponsored positions or similar
              promotional formats are introduced, any material commercial
              relationship affecting that presentation should be disclosed
              clearly and close to the relevant content. Sponsored or featured
              content should be labelled so users can distinguish it from a
              basic factual display.
            </p>
          </DisclosureSection>

          <DisclosureSection id="partner-role" number="07" title="Licensed insurance partner responsibilities">
            <p style={paragraphStyle}>
              Relevant licensed insurance partners are responsible for:
            </p>

            <BulletList
              items={[
                "determining whether a user is eligible for a product;",
                "determining premiums, fees and payment terms;",
                "carrying out underwriting and making underwriting decisions;",
                "providing regulated insurance advice or recommendations where applicable;",
                "supplying official policy wording, disclosures and final terms; and",
                "issuing, activating and administering insurance policies.",
              ]}
            />

            <p style={paragraphStyle}>
              Any insurance contract is between the user and the licensed
              partner identified in the offer or policy documents. That
              partner&apos;s terms, privacy notice and regulatory disclosures apply
              to its products and services.
            </p>
          </DisclosureSection>

          <DisclosureSection id="education" number="08" title="Educational and blog content">
            <p style={paragraphStyle}>
              Blog guides and educational materials provide general information
              only. They may contain links or references to insurance services
              or partners in the future. Where a material affiliate or referral
              relationship applies to linked or referenced content, an
              appropriate disclosure should be presented clearly in or near
              that content.
            </p>

            <p style={paragraphStyle}>
              Educational content does not provide regulated insurance advice
              or a personal recommendation and may not reflect every insurer,
              product, jurisdiction, policy wording or current regulatory
              requirement.
            </p>
          </DisclosureSection>

          <DisclosureSection id="referrals" number="09" title="Affiliate links and referrals in plain language">
            <p style={paragraphStyle}>
              A referral or affiliate relationship means that The Meta Insurance
              may receive compensation if you complete a qualifying action after
              being connected or referred to a partner. A qualifying action
              might be clicking or continuing to the partner, submitting an
              accepted request, or purchasing or activating an insurance
              product, depending on the applicable arrangement.
            </p>

            <p style={paragraphStyle}>
              Clicking a link or submitting a request does not by itself create
              an insurance contract. You should confirm the identity, licensing
              status, product details and final terms of the partner before
              proceeding.
            </p>
          </DisclosureSection>

          <DisclosureSection id="choice" number="10" title="Your choice">
            <p style={paragraphStyle}>
              You are free to decide whether to continue with a referred
              insurance partner. Submitting an insurance request, receiving
              partner details, viewing a factual comparison or following a link
              does not require you to purchase, activate or renew an insurance
              product.
            </p>

            <p style={paragraphStyle}>
              Before deciding, you may ask the licensed partner questions,
              review its official documents, seek regulated advice where needed,
              and consider alternatives available inside or outside the
              platform.
            </p>
          </DisclosureSection>

          <DisclosureSection id="no-guarantee" number="11" title="No guarantee from a referral">
            <p style={paragraphStyle}>
              A referral, click, lead acceptance or other partner connection
              does not guarantee:
            </p>

            <BulletList
              items={[
                "eligibility for an insurance product;",
                "acceptance of an application or request;",
                "any particular premium or price;",
                "any specific coverage, benefit, limit or condition; or",
                "underwriting approval, policy activation or policy issuance.",
              ]}
            />

            <p style={paragraphStyle}>
              Insurance coverage begins only if and when the licensed insurance
              partner confirms that coverage is bound or a policy is active
              under its own terms.
            </p>
          </DisclosureSection>

          <DisclosureSection id="conflicts" number="12" title="Potential conflicts and transparency">
            <p style={paragraphStyle}>
              Referral, affiliate, lead-generation and other commercial
              relationships can create potential conflicts of interest because
              The Meta Insurance may benefit financially from certain user
              actions or partner outcomes. The purpose of this disclosure is to
              make that possibility clear so users can consider it when viewing
              information or deciding whether to continue with a partner.
            </p>

            <p style={paragraphStyle}>
              Material commercial relationships should be disclosed in a clear
              and timely way, especially where they affect sponsored content,
              featured placement or another presentation that a user could
              reasonably interpret as neutral factual information.
            </p>
          </DisclosureSection>

          <DisclosureSection id="changes" number="13" title="Changes to this disclosure">
            <p style={paragraphStyle}>
              Affiliate and partner relationships, compensation events,
              available products and platform features may change over time. We
              may update this Affiliate Disclosure to reflect those changes,
              new legal requirements or the development of the platform.
            </p>

            <p style={paragraphStyle}>
              The updated version will be published on this page and the
              &quot;Last updated&quot; date will change. Material disclosures should
              also be placed close to the relevant link, placement or content
              where required by applicable law.
            </p>
          </DisclosureSection>

          <DisclosureSection id="contact" number="14" title="Contact and related legal pages">
            <p style={paragraphStyle}>
              Contact details for questions about this disclosure will be
              provided through the platform&apos;s Contact page once that page is
              published. The repository does not currently establish a contact
              email, postal address or separate legal entity name, so this draft
              does not invent one.
            </p>

            <div style={legalLinksGridStyle}>
              <a href="/privacy" style={legalLinkCardStyle}>
                <span style={legalLinkLabelStyle}>LEGAL &amp; TRUST</span>
                <strong style={legalLinkTitleStyle}>Privacy Policy</strong>
                <span style={legalLinkTextStyle}>
                  How personal information is handled.
                </span>
              </a>

              <a href="/terms" style={legalLinkCardStyle}>
                <span style={legalLinkLabelStyle}>LEGAL &amp; TRUST</span>
                <strong style={legalLinkTitleStyle}>Terms &amp; Conditions</strong>
                <span style={legalLinkTextStyle}>
                  Rules for using the platform.
                </span>
              </a>
            </div>
          </DisclosureSection>

          <aside style={finalNoticeStyle}>
            <strong>MVP legal review required.</strong> This Affiliate
            Disclosure is a working draft for Point 3 of the Legal &amp; Trust
            roadmap. It is not a substitute for advice from a qualified legal
            professional and should be reviewed and adapted before full
            commercial launch.
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function DisclosureSection({
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
    <section id={id} style={disclosureSectionStyle}>
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
  maxWidth: "850px",
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

const updatedStyle: CSSProperties = {
  margin: "24px 0 0",
  color: "#bae6fd",
  fontSize: "14px",
  fontWeight: 700,
};

const contentBackgroundStyle: CSSProperties = {
  padding: "64px 7% 90px",
  background: "#f8fafc",
};

const contentContainerStyle: CSSProperties = {
  maxWidth: "940px",
  margin: "0 auto",
};

const coreDisclosureStyle: CSSProperties = {
  marginBottom: "24px",
  padding: "clamp(25px, 5vw, 34px)",
  border: "2px solid #0284c7",
  borderRadius: "16px",
  background: "#f0f9ff",
  boxShadow: "0 12px 32px rgba(2, 132, 199, 0.12)",
};

const coreLabelStyle: CSSProperties = {
  marginBottom: "12px",
  color: "#0369a1",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.09em",
};

const coreStatementStyle: CSSProperties = {
  display: "block",
  color: "#0c4a6e",
  fontSize: "clamp(20px, 3.5vw, 26px)",
  lineHeight: 1.45,
};

const coreDetailStyle: CSSProperties = {
  margin: "18px 0 0",
  color: "#075985",
  fontSize: "15px",
  lineHeight: 1.75,
};

const draftNoticeStyle: CSSProperties = {
  marginBottom: "24px",
  padding: "22px 24px",
  border: "1px solid #f59e0b",
  borderRadius: "14px",
  background: "#fffbeb",
  color: "#78350f",
  fontSize: "14px",
  lineHeight: 1.7,
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

const disclosureSectionStyle: CSSProperties = {
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

const calloutStyle: CSSProperties = {
  margin: "22px 0",
  padding: "20px 22px",
  border: "1px solid",
  borderRadius: "13px",
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

const comparisonGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "12px",
  margin: "22px 0",
};

const comparisonItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 16px",
  border: "1px solid #e2e8f0",
  borderRadius: "11px",
  background: "#f8fafc",
  color: "#334155",
  fontSize: "15px",
  fontWeight: 700,
};

const comparisonMarkerStyle: CSSProperties = {
  color: "#0284c7",
  fontSize: "18px",
  fontWeight: 900,
};

const legalLinksGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  marginTop: "24px",
};

const legalLinkCardStyle: CSSProperties = {
  display: "block",
  padding: "22px",
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
  fontSize: "18px",
};

const legalLinkTextStyle: CSSProperties = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: 1.6,
};

const finalNoticeStyle: CSSProperties = {
  padding: "24px",
  border: "1px solid #fde68a",
  borderRadius: "14px",
  background: "#fffbeb",
  color: "#78350f",
  fontSize: "14px",
  lineHeight: 1.75,
};
