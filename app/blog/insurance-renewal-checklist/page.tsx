import type { Metadata } from "next";
import BrandLogo from "../../components/BrandLogo";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "What to Check Before Renewing Your Insurance | The Meta Insurance",
  description:
    "A practical insurance renewal checklist covering premiums, coverage limits, deductibles, exclusions, benefits and important policy changes.",

  alternates: {
    canonical: "/blog/insurance-renewal-checklist",
  },

  openGraph: {
    title: "What to Check Before Renewing Your Insurance | The Meta Insurance",
    description:
      "A practical insurance renewal checklist covering premiums, coverage limits, deductibles, exclusions, benefits and important policy changes.",
    url: "/blog/insurance-renewal-checklist",
    type: "article",
  },

  twitter: {
    card: "summary",
    title: "What to Check Before Renewing Your Insurance | The Meta Insurance",
    description:
      "Review premiums, limits, deductibles, exclusions, benefits and policy changes before renewal.",
  },
};

export default function InsuranceRenewalGuidePage() {
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
          gap: "25px",
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
          <BrandLogo />
        </a>

        <nav
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            flexWrap: "wrap",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <a href="/blog" style={navStyle}>
            Insurance Guides
          </a>

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
          padding: "75px 7%",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              color: "#bae6fd",
              fontSize: "13px",
              fontWeight: 900,
              marginBottom: "16px",
            }}
          >
            INSURANCE RENEWAL GUIDE
          </div>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: "0 0 22px",
            }}
          >
            What to Check Before Renewing Your Insurance
          </h1>

          <p
            style={{
              color: "#e0f2fe",
              fontSize: "19px",
              lineHeight: 1.7,
              maxWidth: "760px",
              margin: 0,
            }}
          >
            A practical checklist for reviewing your existing insurance policy
            and understanding what may have changed before renewal.
          </p>
        </div>
      </section>

      {/* ARTICLE */}
      <article
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: "70px 24px 90px",
          fontSize: "17px",
          lineHeight: 1.8,
          color: "#334155",
        }}
      >
        <p>
          An insurance renewal is a useful opportunity to review your existing
          policy and compare it with the terms offered for the next policy
          period.
        </p>

        <p>
          The premium may change, but other parts of the policy can also change,
          including coverage limits, deductibles, exclusions and additional
          benefits.
        </p>

        <ArticleHeading>
          1. Check the renewal premium
        </ArticleHeading>

        <p>
          Start by comparing the new annual premium with the amount paid during
          the previous policy period.
        </p>

        <p>
          If the price is different, reviewing the rest of the policy terms can
          help identify whether coverage has changed as well.
        </p>

        <InfoBox>
          A higher or lower premium does not necessarily mean that coverage has
          improved or reduced by the same amount.
        </InfoBox>

        <ArticleHeading>
          2. Check your policy information
        </ArticleHeading>

        <p>
          Review the information shown on the renewal documents and make sure
          it remains accurate.
        </p>

        <p>
          Depending on the type of insurance, this may include your contact
          details, insured address, vehicle information, property details or
          other relevant information.
        </p>

        <ArticleHeading>
          3. Review coverage limits
        </ArticleHeading>

        <p>
          Coverage limits determine the maximum amount available for eligible
          claims under different sections of the policy.
        </p>

        <p>
          Compare the renewal limits with the previous policy and identify any
          increases or reductions.
        </p>

        <ArticleHeading>
          4. Review the deductible
        </ArticleHeading>

        <p>
          The deductible, sometimes called an excess, is the amount the insured
          person may need to pay toward an eligible claim.
        </p>

        <p>
          Check whether the renewal policy has the same deductible as the
          current policy.
        </p>

        <ArticleHeading>
          5. Check included benefits
        </ArticleHeading>

        <p>
          Benefits included in an existing policy may not always remain
          identical at renewal.
        </p>

        <p>
          Depending on the insurance category, examples can include:
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Roadside assistance.</li>
          <li>Glass or windscreen protection.</li>
          <li>Replacement vehicle.</li>
          <li>Flood protection.</li>
          <li>Earthquake protection.</li>
          <li>Alternative accommodation.</li>
          <li>Travel delay benefits.</li>
          <li>Baggage protection.</li>
        </ul>

        <ArticleHeading>
          6. Check for removed benefits
        </ArticleHeading>

        <p>
          A renewal policy can sometimes remove or restrict a benefit that was
          available during the previous policy period.
        </p>

        <p>
          Comparing benefits line by line can make these changes easier to
          identify.
        </p>

        <ArticleHeading>
          7. Review exclusions
        </ArticleHeading>

        <p>
          Exclusions describe situations or events that are not covered by an
          insurance policy.
        </p>

        <p>
          Review whether the renewal documents contain new exclusions or
          changes to existing exclusions.
        </p>

        <InfoBox>
          Comparing only the premium can hide important changes in exclusions
          or restrictions.
        </InfoBox>

        <ArticleHeading>
          8. Check geographical coverage
        </ArticleHeading>

        <p>
          Some insurance policies apply only within specific countries,
          territories or geographical regions.
        </p>

        <p>
          This can be particularly important for motor and travel insurance.
        </p>

        <ArticleHeading>
          9. Check special conditions
        </ArticleHeading>

        <p>
          Policies can contain specific conditions that must be followed for
          coverage to apply.
        </p>

        <p>
          Examples can include security requirements, reporting deadlines,
          approved repair networks or documentation requirements.
        </p>

        <ArticleHeading>
          10. Check the policy dates
        </ArticleHeading>

        <p>
          Review the expiration date of the existing policy and the start date
          of the renewal policy.
        </p>

        <p>
          This is important where continuous insurance coverage is required.
        </p>

        <ArticleHeading>
          Example: current policy vs renewal
        </ArticleHeading>

        <p>
          A factual comparison can help show exactly what has changed.
        </p>

        <RenewalComparison />

        <p>
          In this example, the renewal premium is €35 higher and the liability
          limit has increased, while roadside assistance has been removed.
        </p>

        <p>
          This does not determine whether the renewal is appropriate for the
          customer. It simply identifies the factual differences between the
          two policy periods.
        </p>

        <ArticleHeading>
          What should you compare before renewal?
        </ArticleHeading>

        <RenewalChecklist />

        <ArticleHeading>
          Keep your existing policy document
        </ArticleHeading>

        <p>
          Keeping a copy of the current insurance policy can make future
          comparisons significantly easier.
        </p>

        <p>
          Useful documents may include:
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Current insurance policy.</li>
          <li>Policy schedule.</li>
          <li>Coverage summary.</li>
          <li>Renewal notice.</li>
          <li>Previous premium information.</li>
        </ul>

        <p>
          For Motor and Property insurance, The Meta Insurance can also collect
          an existing policy document as part of an insurance request where the
          upload option is available.
        </p>

        {/* CTA */}
        <div
          style={{
            marginTop: "55px",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "18px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 12px",
              fontSize: "27px",
            }}
          >
            Want to review your insurance options?
          </h2>

          <p style={{ marginTop: 0 }}>
            Choose an insurance category, enter your details or upload an
            existing Motor or Property policy where available.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "22px",
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
              Use AI Assistant →
            </a>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div
          style={{
            marginTop: "45px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "14px",
            padding: "20px",
            color: "#92400e",
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          <strong>Important:</strong> This guide is provided for general
          educational purposes only. It does not constitute regulated insurance
          advice or a recommendation to renew, replace or purchase a particular
          insurance product. Coverage and renewal terms vary by insurer and
          policy. Final insurance offers, eligibility decisions and regulated
          advice are provided by licensed insurance partners.
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

function ArticleHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2
      style={{
        fontSize: "29px",
        lineHeight: 1.3,
        color: "#0f172a",
        marginTop: "48px",
        marginBottom: "14px",
      }}
    >
      {children}
    </h2>
  );
}

function InfoBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderLeft: "4px solid #0284c7",
        padding: "18px 20px",
        margin: "28px 0",
        borderRadius: "8px",
        color: "#334155",
      }}
    >
      <strong>Tip:</strong> {children}
    </div>
  );
}

function RenewalComparison() {
  const rows = [
    ["Annual premium", "€450", "€485", "+ €35"],
    ["Deductible", "€500", "€500", "Same"],
    ["Glass cover", "Included", "Included", "Same"],
    ["Roadside assistance", "Included", "Not included", "Removed"],
    ["Liability limit", "€1,000,000", "€1,500,000", "+ €500,000"],
  ];

  return (
    <div
      style={{
        overflowX: "auto",
        margin: "28px 0",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "15px",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Feature</th>
            <th style={thStyle}>Current policy</th>
            <th style={thStyle}>Renewal</th>
            <th style={thStyle}>Difference</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(([feature, current, renewal, difference]) => (
            <tr key={feature}>
              <td style={tdStyle}>
                <strong>{feature}</strong>
              </td>

              <td style={tdStyle}>{current}</td>

              <td style={tdStyle}>{renewal}</td>

              <td style={tdStyle}>
                <strong>{difference}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RenewalChecklist() {
  const rows = [
    ["Premium", "Has the annual price changed?"],
    ["Coverage limits", "Are the insured limits different?"],
    ["Deductible", "Has the deductible increased or decreased?"],
    ["Benefits", "Have any benefits been added or removed?"],
    ["Exclusions", "Are there new or changed exclusions?"],
    ["Territory", "Has geographical coverage changed?"],
    ["Policy details", "Is the insured information still correct?"],
    ["Policy dates", "Are the expiry and renewal dates correct?"],
  ];

  return (
    <div
      style={{
        overflowX: "auto",
        margin: "28px 0",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "15px",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Check</th>
            <th style={thStyle}>Question</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(([check, question]) => (
            <tr key={check}>
              <td style={tdStyle}>
                <strong>{check}</strong>
              </td>

              <td style={tdStyle}>{question}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const navStyle = {
  color: "#0f172a",
  textDecoration: "none",
};

const buttonStyle = {
  background: "#0284c7",
  color: "#ffffff",
  padding: "13px 18px",
  borderRadius: "9px",
  textDecoration: "none",
  fontWeight: 800,
};

const thStyle = {
  textAlign: "left" as const,
  background: "#0f172a",
  color: "#ffffff",
  padding: "14px",
  border: "1px solid #334155",
};

const tdStyle = {
  padding: "14px",
  border: "1px solid #e2e8f0",
  verticalAlign: "top" as const,
};
