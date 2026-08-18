import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";

const siteName = "The Meta Insurance";
const siteUrl = "https://www.themetainsurance.com";
const pageTitle = "Terms & Conditions | The Meta Insurance";
const pageDescription =
  "Read the MVP Terms & Conditions for using The Meta Insurance website, insurance request tools, policy uploads and AI Assistant Lite.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    url: "/terms",
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
  ["acceptance", "Acceptance of these terms"],
  ["role", "Platform role"],
  ["no-advice", "No regulated insurance advice"],
  ["partners", "Licensed insurance partners"],
  ["requests", "Insurance requests"],
  ["comparisons", "Factual comparisons"],
  ["information", "User information"],
  ["uploads", "Policy document uploads"],
  ["assistant", "AI Assistant Lite"],
  ["third-parties", "Third-party partners and websites"],
  ["affiliate", "Affiliate and referral relationships"],
  ["availability", "Service availability"],
  ["conduct", "User conduct"],
  ["intellectual-property", "Intellectual property"],
  ["education", "Educational and blog content"],
  ["warranties", "No warranties"],
  ["liability", "Limitation of liability"],
  ["indemnity", "Limited indemnity"],
  ["privacy", "Privacy"],
  ["changes", "Changes to these terms"],
  ["law", "Governing law and jurisdiction"],
  ["contact", "Contact"],
] as const;

export default function TermsAndConditionsPage() {
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

          <h1 style={heroTitleStyle}>Terms &amp; Conditions</h1>

          <p style={heroTextStyle}>
            These terms explain the rules that apply when you use The Meta
            Insurance website, insurance request tools, policy upload features,
            guides and AI Assistant Lite.
          </p>

          <p style={updatedStyle}>Last updated: 18 August 2026</p>
        </div>
      </section>

      <section style={contentBackgroundStyle}>
        <div style={contentContainerStyle}>
          <aside aria-label="Legal draft notice" style={draftNoticeStyle}>
            <strong style={{ display: "block", marginBottom: "6px" }}>
              MVP legal draft
            </strong>
            These Terms &amp; Conditions are an MVP legal draft. They must be
            reviewed and adapted by a qualified legal professional before the
            platform&apos;s full commercial launch, including confirmation of
            the responsible legal entity, contact details, governing law and
            jurisdiction.
          </aside>

          <nav aria-label="Terms and Conditions contents" style={contentsCardStyle}>
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

          <TermsSection id="acceptance" number="01" title="Acceptance of these terms">
            <p style={paragraphStyle}>
              By accessing or using the website at{" "}
              <a href={siteUrl} style={inlineLinkStyle}>
                {siteUrl}
              </a>
              , its forms, AI Assistant Lite, policy upload features, guides or
              related services, you agree to these Terms &amp; Conditions. If you
              do not agree, you should not use those services.
            </p>

            <p style={paragraphStyle}>
              If you use the platform on behalf of another person or an
              organisation, you confirm that you have authority to act for them
              and to accept these terms for the relevant use. These terms apply
              alongside any notices or consents presented during a request.
            </p>
          </TermsSection>

          <TermsSection id="role" number="02" title="Platform role">
            <p style={paragraphStyle}>
              The Meta Insurance is a technology, information, referral and
              affiliate platform. It provides general insurance information,
              guided information-collection tools and factual comparison
              functionality intended to help users organise and submit an
              insurance request to relevant licensed insurance partners.
            </p>

            <Callout>
              <strong>The Meta Insurance does not currently act as an insurer,
              licensed insurance broker or insurance underwriter.</strong> It
              does not underwrite risk, bind insurance cover, issue policies or
              make final recommendations. Relevant licensed insurance partners
              handle those regulated and contractual activities.
            </Callout>
          </TermsSection>

          <TermsSection id="no-advice" number="03" title="No regulated insurance advice">
            <p style={paragraphStyle}>
              Website content, insurance guides, form prompts, comparison
              displays and AI Assistant Lite are provided for information
              collection and general educational purposes. They do not
              constitute regulated insurance advice, a personal recommendation
              or a determination that a product is suitable for you.
            </p>

            <p style={paragraphStyle}>
              You should review the official policy wording, exclusions,
              limits, deductibles, conditions and pricing supplied by the
              licensed insurance partner. Ask that partner for regulated advice
              where you need help assessing suitability or making an insurance
              decision.
            </p>
          </TermsSection>

          <TermsSection id="partners" number="04" title="Licensed insurance partners">
            <p style={paragraphStyle}>
              Relevant licensed insurance partners are responsible for final
              insurance offers, eligibility decisions, underwriting decisions,
              regulated advice, recommendations, policy wording, pricing,
              payment terms, policy issuance, insurance contracts and final
              terms. A partner may request additional information or documents
              before deciding whether it can offer insurance.
            </p>

            <p style={paragraphStyle}>
              Any insurance contract is entered into with the licensed
              insurance partner identified in the offer or policy documents,
              not with The Meta Insurance. The partner&apos;s terms, disclosures,
              privacy notice, payment requirements and policy wording apply to
              its products and services.
            </p>
          </TermsSection>

          <TermsSection id="requests" number="05" title="Insurance requests">
            <p style={paragraphStyle}>
              Submitting information through the platform creates an insurance
              request for referral and follow-up. It is not an application
              acceptance, quotation, insurance offer, binder, policy or promise
              that insurance will be available.
            </p>

            <p style={paragraphStyle}>A submitted request does not guarantee:</p>
            <BulletList
              items={[
                "that an insurance offer will be made;",
                "acceptance of an application or request;",
                "eligibility for any product;",
                "any specific premium or price;",
                "any specific coverage, limit, benefit or condition; or",
                "underwriting approval or policy issuance.",
              ]}
            />

            <p style={paragraphStyle}>
              Cover does not begin merely because you submit a request, receive
              a comparison or communicate through the platform. Cover begins
              only if and when a licensed insurance partner confirms it under
              its own terms.
            </p>
          </TermsSection>

          <TermsSection id="comparisons" number="06" title="Factual comparisons">
            <p style={paragraphStyle}>
              The platform may organise or display factual policy information
              supplied by you or relevant partners. Depending on what is
              available, a factual comparison may cover:
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

            <Callout tone="blue">
              A factual comparison describes differences in available
              information. It does not assess your individual needs or determine
              which policy is suitable for you. Verify all comparison details
              against the licensed partner&apos;s current official documents before
              making a decision.
            </Callout>
          </TermsSection>

          <TermsSection id="information" number="07" title="User information and authority">
            <p style={paragraphStyle}>
              You must provide information that is accurate, current and
              complete to the best of your knowledge. You are responsible for
              reviewing the information before submitting it and for correcting
              material errors through an available contact channel or directly
              with the licensed insurance partner handling the request.
            </p>

            <p style={paragraphStyle}>
              Where a request includes information about another person,
              including another traveller or a minor, you must have lawful
              authority to provide that information and any required permission
              or consent. Do not provide information or documents that you are
              not entitled to share.
            </p>

            <p style={paragraphStyle}>
              Inaccurate, incomplete or outdated information can affect whether
              a partner can assess the request, the pricing or terms it offers,
              or the validity of any later insurance arrangement under the
              partner&apos;s rules and applicable law.
            </p>
          </TermsSection>

          <TermsSection id="uploads" number="08" title="Uploaded Motor and Property policy documents">
            <p style={paragraphStyle}>
              Where the feature is available, you may upload an existing Motor
              or Property insurance policy to support a request or factual
              comparison. You must upload only documents that you are authorised
              to possess, use and provide for this purpose.
            </p>

            <p style={paragraphStyle}>
              Do not upload a document that is unlawful, misleading, altered to
              deceive, infected with malicious code, or unrelated to the
              request. You should remove information that is not needed where
              practical and must not use the upload feature to distribute files
              to other people.
            </p>

            <Callout tone="blue">
              The current MVP validates supported file types and file size. It
              does not claim to provide malware scanning, authenticity checks
              or advanced document verification. Acceptance of an upload does
              not confirm that a document is accurate, complete, genuine or
              suitable for a partner&apos;s underwriting process.
            </Callout>
          </TermsSection>

          <TermsSection id="assistant" number="09" title="AI Assistant Lite">
            <p style={paragraphStyle}>
              AI Assistant Lite follows a guided question flow to collect
              structured information for Travel, Motor or Property insurance
              requests. It may ask about the item to be insured, travel plans,
              vehicle or property details and contact information, then prepare
              those answers for submission after the consent step.
            </p>

            <Callout>
              AI Assistant Lite does not provide regulated insurance advice,
              independently determine product suitability, make an underwriting
              or eligibility decision, recommend a product, bind cover or issue
              a policy. Its prompts are information-collection tools only.
            </Callout>

            <p style={paragraphStyle}>
              You are responsible for checking your answers before submission.
              A licensed insurance partner may need to verify the information
              and ask further questions before providing any offer or advice.
            </p>
          </TermsSection>

          <TermsSection id="third-parties" number="10" title="Third-party partners and websites">
            <p style={paragraphStyle}>
              The platform may refer or redirect you to a relevant licensed
              insurance partner or another third-party website or service. The
              third party is responsible for its own products, services,
              systems, availability, content, privacy practices and contractual
              terms.
            </p>

            <p style={paragraphStyle}>
              A link, referral or technical connection does not mean that The
              Meta Insurance controls the third party or guarantees its products
              or conduct. Review the partner&apos;s terms, privacy notice, regulatory
              disclosures and policy documents before proceeding.
            </p>
          </TermsSection>

          <TermsSection id="affiliate" number="11" title="Affiliate and referral relationships">
            <p style={paragraphStyle}>
              The Meta Insurance may receive referral, affiliate or other
              commercial compensation from a partner where applicable. The
              existence and structure of any compensation can depend on the
              partner relationship and the activity involved.
            </p>

            <p style={paragraphStyle}>
              No commission amount or specific partner arrangement is promised
              or described in these terms. A commercial relationship does not
              change the platform&apos;s role and does not make The Meta Insurance
              the insurer, broker, underwriter or provider of regulated advice.
            </p>
          </TermsSection>

          <TermsSection id="availability" number="12" title="No guarantee of availability">
            <p style={paragraphStyle}>
              We may change, update, limit, suspend or discontinue all or part
              of the platform, including a form, guide, upload feature,
              comparison display or AI Assistant Lite. We may also introduce or
              remove insurance categories or partner connections.
            </p>

            <p style={paragraphStyle}>
              Website and service availability is not guaranteed. Maintenance,
              technical faults, third-party failures, security events, network
              conditions or other circumstances may interrupt or limit access.
              Where practical, we will take reasonable steps to maintain and
              restore the service.
            </p>
          </TermsSection>

          <TermsSection id="conduct" number="13" title="User conduct">
            <p style={paragraphStyle}>You must not use the platform to:</p>
            <BulletList
              items={[
                "make a fraudulent, deceptive or deliberately misleading submission;",
                "impersonate another person or falsely claim authority to act for them;",
                "upload a document without authorisation or infringe another person's privacy or rights;",
                "introduce malware, malicious code or other harmful material;",
                "attempt to access an account, document, database, server or system without permission;",
                "scrape, overload, probe, disrupt or abuse the website, APIs, forms or upload tools;",
                "send spam, unsolicited promotions or repetitive automated submissions; or",
                "engage in unlawful activity or encourage another person to do so.",
              ]}
            />

            <p style={paragraphStyle}>
              We may reject a submission or restrict access where reasonably
              necessary to protect users, partners, the platform or third
              parties, investigate suspected misuse, or comply with law. Any
              such action remains subject to applicable law.
            </p>
          </TermsSection>

          <TermsSection id="intellectual-property" number="14" title="Intellectual property">
            <p style={paragraphStyle}>
              The Meta Insurance branding, original website content, design,
              interface and other original materials are protected by
              intellectual-property and related laws to the extent permitted by
              applicable law. Subject to these terms, you may access and use the
              platform for your own lawful, personal or internal business
              insurance-request purposes.
            </p>

            <p style={paragraphStyle}>
              You may not copy, republish, sell, license, reverse engineer or
              commercially exploit protected platform materials except where
              permission has been given or applicable law allows it. Third-party
              names, logos, policy wording and other materials remain the
              property of their respective owners; these terms do not claim
              ownership of third-party content.
            </p>
          </TermsSection>

          <TermsSection id="education" number="15" title="Educational and blog content">
            <p style={paragraphStyle}>
              Insurance guides, articles, examples and explanations provide
              general educational information only. They may simplify complex
              subjects and may not reflect every insurer, product, jurisdiction,
              policy wording, market practice or current regulatory requirement.
            </p>

            <p style={paragraphStyle}>
              Educational content should not be treated as legal, tax, financial
              or regulated insurance advice. Always use the current official
              information supplied by a relevant licensed partner and obtain
              professional advice where appropriate.
            </p>
          </TermsSection>

          <TermsSection id="warranties" number="16" title="No warranties">
            <p style={paragraphStyle}>
              To the extent permitted by applicable law, the platform is
              provided on an &quot;as available&quot; basis. We do not guarantee
              uninterrupted or error-free operation, that every item of
              information will always be complete or current, that a submission
              will reach a particular partner, or that insurance will be
              available.
            </p>

            <p style={paragraphStyle}>
              Nothing in these terms removes warranties, protections or remedies
              that cannot lawfully be excluded. Information supplied by users,
              licensed partners or other third parties may be outside our
              control and should be independently checked where material.
            </p>
          </TermsSection>

          <TermsSection id="liability" number="17" title="Limitation of liability">
            <p style={paragraphStyle}>
              Nothing in these terms excludes or limits liability where doing so
              would be unlawful, including any non-excludable statutory rights
              or remedies. Any limitation in this section applies only to the
              extent permitted by the law that ultimately applies.
            </p>

            <p style={paragraphStyle}>
              Subject to that qualification, The Meta Insurance is not
              responsible for an insurer&apos;s or partner&apos;s underwriting,
              eligibility, advice, recommendation, pricing, payment, policy
              issuance, claims decision or contractual performance. The Meta
              Insurance is also not responsible for loss caused by inaccurate
              information supplied by a user or third party, or by reasonable
              reliance on educational content as though it were personal advice.
            </p>

            <p style={paragraphStyle}>
              To the extent permitted by applicable law, liability for indirect
              or consequential loss arising from service interruption,
              unauthorised misuse or third-party services may be limited. This
              wording is intended to be interpreted narrowly and does not limit
              liability caused by conduct for which limitation is prohibited.
            </p>
          </TermsSection>

          <TermsSection id="indemnity" number="18" title="Limited indemnity">
            <p style={paragraphStyle}>
              To the extent permitted by applicable law, you agree to reimburse
              The Meta Insurance for direct and reasonably documented losses or
              costs caused by your fraudulent or unlawful use of the platform,
              a document you knowingly uploaded without authority, or your
              deliberate infringement of another person&apos;s rights.
            </p>

            <p style={paragraphStyle}>
              This obligation applies only to the extent the loss was caused by
              your conduct and does not apply where prohibited by law or where
              The Meta Insurance caused or materially contributed to the loss.
            </p>
          </TermsSection>

          <TermsSection id="privacy" number="19" title="Privacy">
            <p style={paragraphStyle}>
              Our{" "}
              <a href="/privacy" style={inlineLinkStyle}>
                Privacy Policy
              </a>{" "}
              explains how personal information is collected, used, stored and
              shared through insurance request forms, uploaded policy documents
              and AI Assistant Lite. Please read it before submitting personal
              information.
            </p>
          </TermsSection>

          <TermsSection id="changes" number="20" title="Changes to these terms">
            <p style={paragraphStyle}>
              We may update these Terms &amp; Conditions as the MVP develops,
              platform features or partner relationships change, or legal
              requirements evolve. The updated version will be published on
              this page and the &quot;Last updated&quot; date will change.
            </p>

            <p style={paragraphStyle}>
              Where required by applicable law, a material change will be
              highlighted or additional consent will be requested. Continuing
              to use the platform after an updated version takes effect may
              constitute acceptance where the law permits that approach.
            </p>
          </TermsSection>

          <TermsSection id="law" number="21" title="Governing law and jurisdiction">
            <Callout tone="blue">
              A governing law and court jurisdiction have not yet been selected
              for this MVP draft. They will be confirmed and added before full
              commercial launch following review by a qualified legal
              professional. Nothing in the final terms should remove mandatory
              protections available to users under applicable law.
            </Callout>
          </TermsSection>

          <TermsSection id="contact" number="22" title="Contact">
            <p style={paragraphStyle}>
              Contact details for questions about these terms will be provided
              through the platform&apos;s Contact page once that page is published.
              When available, please use that channel and include enough
              information to identify the subject of your question without
              sending unnecessary sensitive information.
            </p>

            <Callout tone="blue">
              The repository does not currently establish a contact email,
              company address or separate legal entity name, so this draft does
              not invent one. Those details must be confirmed and published
              before full commercial launch.
            </Callout>
          </TermsSection>

          <aside style={finalNoticeStyle}>
            <strong>MVP legal review required.</strong> These Terms &amp;
            Conditions are a working draft for Point 2 of the Legal &amp; Trust
            roadmap. They are not a substitute for advice from a qualified
            legal professional and must be reviewed and adapted before full
            commercial launch.
          </aside>
        </div>
      </section>

      <footer style={footerStyle}>
        <div style={footerInnerStyle}>
          <div>
            <strong style={footerBrandStyle}>The Meta Insurance</strong>
            <span>Technology, referral and affiliate platform.</span>
          </div>

          <div style={footerLinksStyle}>
            {navigation.map((item) => (
              <a key={item.href} href={item.href} style={footerLinkStyle}>
                {item.label}
              </a>
            ))}
            <a href="/privacy" style={footerLinkStyle}>
              Privacy
            </a>
            <a href="/terms" aria-current="page" style={footerActiveLinkStyle}>
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function TermsSection({
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
    <section id={id} style={termsSectionStyle}>
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

const termsSectionStyle: CSSProperties = {
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

const inlineLinkStyle: CSSProperties = {
  color: "#0284c7",
  fontWeight: 700,
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

const finalNoticeStyle: CSSProperties = {
  padding: "24px",
  border: "1px solid #fde68a",
  borderRadius: "14px",
  background: "#fffbeb",
  color: "#78350f",
  fontSize: "14px",
  lineHeight: 1.75,
};

const footerStyle: CSSProperties = {
  padding: "45px 7%",
  background: "#020617",
  color: "#94a3b8",
};

const footerInnerStyle: CSSProperties = {
  maxWidth: "1180px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  gap: "30px",
  flexWrap: "wrap",
};

const footerBrandStyle: CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#ffffff",
};

const footerLinksStyle: CSSProperties = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
};

const footerLinkStyle: CSSProperties = {
  color: "#94a3b8",
  textDecoration: "none",
};

const footerActiveLinkStyle: CSSProperties = {
  color: "#e0f2fe",
  textDecoration: "none",
  fontWeight: 700,
};
