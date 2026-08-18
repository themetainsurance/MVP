import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";

const siteName = "The Meta Insurance";
const siteUrl = "https://www.themetainsurance.com";
const pageTitle = "Privacy Policy | The Meta Insurance";
const pageDescription =
  "Learn how The Meta Insurance handles personal data for insurance requests, policy document uploads and AI Assistant Lite.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    url: "/privacy",
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
  ["scope", "Scope and platform role"],
  ["information", "Information we collect"],
  ["documents", "Uploaded policy documents"],
  ["assistant", "AI Assistant Lite"],
  ["purposes", "Purposes of processing"],
  ["sharing", "How information is shared"],
  ["providers", "Technology providers"],
  ["security", "Security"],
  ["retention", "Retention and deletion"],
  ["international", "International processing"],
  ["rights", "Your privacy rights"],
  ["cookies", "Cookies and analytics"],
  ["children", "Children and minors"],
  ["third-parties", "Third-party websites"],
  ["updates", "Policy updates"],
  ["contact", "Privacy requests"],
] as const;

export default function PrivacyPolicyPage() {
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

          <h1 style={heroTitleStyle}>Privacy Policy</h1>

          <p style={heroTextStyle}>
            This policy explains how The Meta Insurance collects, uses, stores
            and shares personal information when you use our insurance request
            tools, upload a policy or use AI Assistant Lite.
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
            This Privacy Policy is an MVP legal draft. It must be reviewed and
            adapted by a qualified legal professional before the platform&apos;s
            full commercial launch, including confirmation of the responsible
            legal entity, contact details and applicable jurisdiction-specific
            requirements.
          </aside>

          <nav aria-label="Privacy Policy contents" style={contentsCardStyle}>
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

          <PrivacySection id="scope" number="01" title="Scope and platform role">
            <p style={paragraphStyle}>
              This Privacy Policy applies to personal information handled
              through the website at <a href={siteUrl} style={inlineLinkStyle}>{siteUrl}</a>,
              including its travel, motor and property insurance request forms,
              policy upload tools and AI Assistant Lite.
            </p>

            <Callout>
              <strong>The Meta Insurance is a technology, referral and affiliate
              platform.</strong> It is not currently an insurer or a licensed
              insurance broker. The platform does not provide regulated
              insurance advice or final recommendations. Insurance products,
              eligibility decisions, regulated advice, final recommendations
              and final terms are provided by relevant licensed insurance
              partners.
            </Callout>

            <p style={paragraphStyle}>
              A licensed insurance partner may provide its own privacy notice
              when it receives or collects your information. That partner&apos;s
              notice will govern its separate processing activities.
            </p>
          </PrivacySection>

          <PrivacySection id="information" number="02" title="Information we collect">
            <p style={paragraphStyle}>
              We collect information that you choose to provide through the
              platform. The fields used depend on the type of request you make.
            </p>

            <div style={dataGridStyle}>
              <DataCard title="Contact information">
                Full name, email address, phone number and preferred contact
                method. Some forms permit an email address or phone number,
                while AI Assistant Lite currently asks for an email address and
                allows the phone number to be skipped.
              </DataCard>

              <DataCard title="Travel insurance requests">
                Trip type, country of residence, destination, departure and
                return dates, purpose of travel, coverage area, number of
                travellers, traveller ages and requested coverage options.
              </DataCard>

              <DataCard title="Motor insurance requests">
                Request method, vehicle make and model, manufacturing year,
                registration country, fuel type, engine or power information,
                current insurer, current annual premium, deductible and
                coverage type.
              </DataCard>

              <DataCard title="Property insurance requests">
                Request method, property type and use, country and city, year
                built, property size, estimated building and contents values,
                current insurer, current annual premium, deductible and
                coverage type.
              </DataCard>
            </div>

            <p style={paragraphStyle}>
              We also record your consent to process the request and may keep
              operational information associated with a submission, such as a
              request identifier, creation time, status and source. Hosting and
              security infrastructure may process basic technical information,
              such as IP address, browser or device details and request logs,
              where necessary to deliver and protect the service.
            </p>

            <p style={paragraphStyle}>
              Please do not include health information, financial account
              information or other sensitive personal information in free-text
              fields unless a licensed partner specifically requests it and
              explains why it is needed.
            </p>
          </PrivacySection>

          <PrivacySection id="documents" number="03" title="Uploaded Motor and Property policy documents">
            <p style={paragraphStyle}>
              You may upload an existing Motor or Property insurance policy in
              PDF, JPG, JPEG or PNG format. An uploaded policy can contain
              personal information and insurance details beyond the form fields
              listed above, including names, addresses, policy numbers, vehicle
              or property information, coverage, premium and claims-related
              information included in the document.
            </p>

            <Callout tone="blue">
              Uploaded documents are intended to be stored in private storage
              and are not intended to be publicly accessible. The platform
              stores a private document path with the related request rather
              than publishing a public document link.
            </Callout>

            <p style={paragraphStyle}>
              Upload only a document you are authorised to share and remove
              information that is not needed for the request where practical.
              Access may be provided to authorised service personnel and
              relevant licensed insurance partners where needed to handle your
              request.
            </p>
          </PrivacySection>

          <PrivacySection id="assistant" number="04" title="AI Assistant Lite data collection">
            <p style={paragraphStyle}>
              AI Assistant Lite uses a guided conversation to collect structured
              information for a Travel, Motor or Property insurance request.
              Depending on the request, this can include destination and travel
              dates, traveller count, vehicle make, model and year, property
              type, location and approximate value, and your contact details.
            </p>

            <p style={paragraphStyle}>
              In the current MVP, the visible conversation is used to build
              structured answers. When you consent and submit, those structured
              answers are sent as an insurance request; the full visible chat
              transcript is not separately submitted by the current
              implementation.
            </p>

            <Callout>
              AI Assistant Lite collects information for insurance requests. It
              does not provide regulated insurance advice, determine
              eligibility, recommend an insurance product or make a final
              decision. Relevant licensed insurance partners provide any
              regulated advice, eligibility decision, recommendation, product
              offer and final terms.
            </Callout>
          </PrivacySection>

          <PrivacySection id="purposes" number="05" title="Purposes of processing">
            <p style={paragraphStyle}>We may use personal information to:</p>
            <BulletList
              items={[
                "receive, validate, organise and manage insurance requests you choose to submit;",
                "identify and refer a request to a relevant licensed insurance partner;",
                "enable a partner to contact you using your preferred contact method and continue the requested process;",
                "store and associate an uploaded policy document with the correct request;",
                "operate AI Assistant Lite and convert your answers into structured request information;",
                "communicate about a request, respond to questions and handle privacy requests;",
                "protect the platform, prevent misuse, troubleshoot errors and maintain service reliability; and",
                "meet legal obligations and establish, exercise or defend legal claims where applicable.",
              ]}
            />
            <p style={paragraphStyle}>
              The legal basis for processing will depend on the applicable law
              and context. It may include your consent, taking steps at your
              request before entering a contract with a partner, legitimate
              interests in operating and securing the platform, or compliance
              with a legal obligation. Consent can be withdrawn for future
              processing where consent is the applicable basis.
            </p>
          </PrivacySection>

          <PrivacySection id="sharing" number="06" title="Sharing with licensed insurance partners">
            <p style={paragraphStyle}>
              Where applicable, and after the consent step shown in the
              request flow, we may share the information needed to handle your
              request with relevant licensed insurance partners. A partner may
              use it to contact you, assess eligibility, request additional
              information and provide insurance products, regulated advice,
              recommendations, offers and final terms.
            </p>

            <p style={paragraphStyle}>
              As a referral and affiliate platform, The Meta Insurance may have
              a commercial relationship with a partner in connection with a
              referral. That relationship does not make The Meta Insurance the
              insurer, broker or provider of regulated advice. We do not sell
              personal information merely for an unrelated third party&apos;s own
              advertising through the current MVP.
            </p>

            <p style={paragraphStyle}>
              Information may also be disclosed where required by law, to
              protect rights or safety, in connection with a legitimate business
              reorganisation, or with your direction or additional consent.
            </p>
          </PrivacySection>

          <PrivacySection id="providers" number="07" title="Third-party technology and service providers">
            <p style={paragraphStyle}>
              We rely on third parties to operate the platform. This includes
              website hosting and deployment providers and Supabase-backed
              database and storage infrastructure used by the current
              application for request records and policy-document storage.
              These providers may process information on our behalf to deliver,
              secure, maintain and support their services.
            </p>

            <p style={paragraphStyle}>
              We aim to provide service providers only with information needed
              for their function and to use appropriate contractual and
              technical protections where required. Providers may also process
              limited information for their own lawful security, compliance and
              service-administration purposes under their terms and privacy
              notices.
            </p>
          </PrivacySection>

          <PrivacySection id="security" number="08" title="Security">
            <p style={paragraphStyle}>
              We use reasonable technical and organisational measures designed
              to protect personal information. The current application sends
              requests to server-side endpoints, uses server credentials for
              database and storage operations, validates supported document
              types and size, and is designed to keep uploaded policy documents
              in private storage rather than expose public URLs.
            </p>

            <p style={paragraphStyle}>
              No online service, transmission or storage method is completely
              secure. You should use the platform only on a trusted device and
              network, avoid adding unnecessary sensitive information, and
              notify us through an available contact channel if you believe
              information submitted through the platform may be at risk.
            </p>
          </PrivacySection>

          <PrivacySection id="retention" number="09" title="Data retention and deletion">
            <p style={paragraphStyle}>
              The Meta Insurance has not yet adopted a fixed retention period
              for this MVP. We intend to keep personal information and uploaded
              documents only for as long as reasonably necessary for the
              purposes described in this policy, including handling and
              following up on a request, maintaining security and records,
              resolving disputes and meeting applicable legal obligations.
            </p>

            <p style={paragraphStyle}>
              Retention decisions may consider the status of the request, the
              nature and sensitivity of the information, partner follow-up,
              legal or limitation periods and technical backup cycles. When
              information is no longer needed, it should be deleted or
              anonymised, subject to lawful exceptions and reasonable backup
              processes. You may request deletion as described below; the right
              is not absolute and may be limited by applicable law.
            </p>
          </PrivacySection>

          <PrivacySection id="international" number="10" title="International data processing">
            <p style={paragraphStyle}>
              The platform&apos;s technology providers and licensed insurance
              partners may operate, store data or provide support in countries
              other than the country where you live. As a result, personal
              information may be processed internationally where applicable.
            </p>

            <p style={paragraphStyle}>
              Privacy and data-protection laws can differ between countries.
              Where required, appropriate safeguards should be used for
              international transfers, such as approved contractual terms or
              another lawful transfer mechanism. The applicable locations and
              safeguards should be confirmed as part of legal review before
              commercial launch.
            </p>
          </PrivacySection>

          <PrivacySection id="rights" number="11" title="Your privacy rights">
            <p style={paragraphStyle}>
              Depending on the law that applies to you and the processing, you
              may have rights to:
            </p>
            <BulletList
              items={[
                "ask whether personal information about you is being processed and request access to it;",
                "correct inaccurate or incomplete information;",
                "request deletion of information;",
                "restrict or object to certain processing;",
                "receive certain information in a portable format;",
                "withdraw consent for future processing where processing relies on consent; and",
                "complain to an applicable data-protection or privacy authority.",
              ]}
            />
            <p style={paragraphStyle}>
              We may need to verify your identity and clarify your request
              before responding. Some rights are subject to legal exceptions.
              If a licensed insurance partner separately controls your
              information, you may also need to exercise your rights directly
              with that partner.
            </p>
          </PrivacySection>

          <PrivacySection id="cookies" number="12" title="Cookies and analytics">
            <p style={paragraphStyle}>
              The current MVP application code does not set analytics cookies
              or advertising cookies and does not include an analytics or
              advertising integration. The site can still rely on strictly
              necessary technical mechanisms used by hosting, security or
              network infrastructure to deliver and protect the service where
              applicable.
            </p>

            <p style={paragraphStyle}>
              If analytics, advertising technologies or additional cookies are
              introduced later, this policy should be updated and any notice or
              consent controls required by applicable law should be implemented
              before those technologies are activated.
            </p>
          </PrivacySection>

          <PrivacySection id="children" number="13" title="Children and travel requests involving minors">
            <p style={paragraphStyle}>
              The platform is not directed to children using it independently.
              A travel insurance request may involve a minor traveller and may
              include the traveller&apos;s age. Such a request should be submitted
              only by a parent, legal guardian or another adult authorised to
              provide the information and arrange the request.
            </p>

            <p style={paragraphStyle}>
              Provide only information about a minor that is necessary for the
              insurance request. Do not enter additional identifying, health or
              other sensitive information about a child in free text unless a
              relevant licensed insurance partner lawfully requests it and
              provides an appropriate privacy explanation. If we learn that a
              child submitted personal information without appropriate
              authorisation, we will take reasonable steps to address or delete
              it as required by applicable law.
            </p>
          </PrivacySection>

          <PrivacySection id="third-parties" number="14" title="Third-party websites and services">
            <p style={paragraphStyle}>
              The platform may link to websites or services operated by
              licensed insurance partners or other third parties. We do not
              control those third-party services, and this Privacy Policy does
              not govern them. Review the third party&apos;s privacy notice and
              terms before providing information directly to it.
            </p>
          </PrivacySection>

          <PrivacySection id="updates" number="15" title="Updates to this Privacy Policy">
            <p style={paragraphStyle}>
              We may update this Privacy Policy as the MVP develops, service
              providers or data practices change, licensed partners are added,
              or legal requirements evolve. The revised version should be
              published on this page with an updated date. Where required by
              law, we will provide a more prominent notice or request fresh
              consent for a material change.
            </p>
          </PrivacySection>

          <PrivacySection id="contact" number="16" title="Contact and privacy requests">
            <p style={paragraphStyle}>
              To ask a privacy question or request access, correction, deletion
              or another applicable right, contact The Meta Insurance through
              the contact channel displayed on the website at the time of your
              request. Please describe your request and the insurance-request
              type involved, but do not include a policy document or unnecessary
              sensitive information in the initial message.
            </p>

            <Callout tone="blue">
              This repository does not currently identify a dedicated privacy
              email address, postal address or separate legal entity name, so
              this draft does not invent one. Verified privacy contact details
              and the responsible legal entity must be added before full
              commercial launch.
            </Callout>
          </PrivacySection>

          <aside style={finalNoticeStyle}>
            <strong>MVP legal review required.</strong> This document is a
            working privacy draft for Point 1 of the Legal &amp; Trust roadmap.
            It is not a substitute for advice from a qualified legal
            professional and should be reviewed before full commercial launch.
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
            <a href="/privacy" aria-current="page" style={footerActiveLinkStyle}>
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PrivacySection({
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
    <section id={id} style={policySectionStyle}>
      <div style={sectionNumberStyle}>{number}</div>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function DataCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={dataCardStyle}>
      <h3 style={dataCardTitleStyle}>{title}</h3>
      <p style={{ ...paragraphStyle, margin: 0 }}>{children}</p>
    </div>
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
  background: "linear-gradient(135deg, #082f49 0%, #075985 55%, #0369a1 100%)",
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

const policySectionStyle: CSSProperties = {
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

const dataGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
  margin: "24px 0",
};

const dataCardStyle: CSSProperties = {
  padding: "22px",
  border: "1px solid #e2e8f0",
  borderRadius: "13px",
  background: "#f8fafc",
};

const dataCardTitleStyle: CSSProperties = {
  margin: "0 0 10px",
  color: "#0f172a",
  fontSize: "17px",
  lineHeight: 1.35,
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
