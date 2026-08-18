import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What to Check Before Renewing Your Insurance | The Meta Insurance",
  description:
    "Use this practical insurance renewal checklist to review premiums, coverage limits, deductibles, exclusions, personal details and policy changes before renewal.",
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
          The Meta Insurance
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
            before the next renewal date.
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
          Insurance renewal is a useful opportunity to review whether the
          information, limits, deductibles and other terms shown on an existing
          policy are still accurate.
        </p>

        <p>
          Circumstances can change during the policy year, and a renewal offer
          may also contain changes compared with the previous policy period.
        </p>

        <ArticleHeading>
          1. Check the renewal premium
        </ArticleHeading>

        <p>
          Compare the new annual premium with the amount paid during the
          previous policy period.
        </p>

        <p>
          If the price has changed, reviewing the rest of the policy terms can
          help identify whether coverage has also changed.
        </p>

        <InfoBox>
          A premium increase or decrease does not necessarily mean that the
          coverage has changed in the same direction.
        </InfoBox>

        <ArticleHeading>
          2. Check your personal information
        </ArticleHeading>

        <p>
          Make sure the personal information shown on the policy remains
          accurate.
        </p>

        <p>
          Depending on the insurance type, this can include your name, address,
          contact information and other relevant details.
        </p>

        <ArticleHeading>
          3. Review the insured asset or trip information
        </ArticleHeading>

        <p>
          Check whether the information relating to what is being insured is
          still correct.
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Vehicle details for motor insurance.</li>
          <li>Property information for home or property insurance.</li>
          <li>Travel dates and destinations for travel insurance.</li>
        </ul>

        <ArticleHeading>
          4. Review coverage limits
        </ArticleHeading>

        <p>
          Coverage limits determine the maximum amount available for eligible
          claims under different sections of the policy.
        </p>

        <p>
          Compare the renewal limits with the previous policy and check whether
          they still reflect the insured property, vehicle, belongings or other
          relevant exposure.
        </p>

        <ArticleHeading>
          5. Review the deductible
        </ArticleHeading>

        <p>
          The deductible or excess is the amount the insured person may need to
          pay toward an eligible claim.
        </p>

        <p>
          Check whether the deductible has changed compared with the existing
          policy.
        </p>

        <ArticleHeading>
          6. Check included benefits
        </ArticleHeading>

        <p>
          Review the benefits included in the renewal offer and compare them
          with your current policy.
        </p>

        <p>Examples may include:</p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Roadside assistance.</li>
          <li>Glass cover.</li>
          <li>Replacement vehicle.</li>
          <li>Flood protection.</li>
          <li>Earthquake protection.</li>
          <li>Alternative accommodation.</li>
          <li>Baggage cover.</li>
          <li>Travel delay benefits.</li>
        </ul>

        <ArticleHeading>
          7. Review exclusions
        </ArticleHeading>

        <p>
          Exclusions describe situations and events that are not covered.
        </p>

        <p>
          Renewal documents should be reviewed for changes to exclusions,
          restrictions or special conditions.
        </p>

        <InfoBox>
          Do not compare only the premium. A change in exclusions can materially
          affect the actual scope of coverage.
        </InfoBox>

        <ArticleHeading>
          8. Check geographical coverage
        </ArticleHeading>

        <p>
          For some types of insurance, the geographical area in which the
          policy applies is important.
        </p>

        <p>
          Check whether territorial limits have changed, especially for motor
          and travel insurance.
        </p>

        <ArticleHeading>
          9. Check optional cover
        </ArticleHeading>

        <p>
          Optional benefits may have been added, removed or repriced at
          renewal.
        </p>

        <p>
          It can be useful to separate the base coverage from optional
          additions when comparing the old and new policy.
        </p>

        <ArticleHeading>
          10. Check the renewal date
        </ArticleHeading>

        <p>
          Make sure you know when the existing policy expires and when the
          renewal policy is scheduled to start.
        </p>

        <p>
          This helps avoid an unintended gap in insurance coverage where
          continuous coverage is required.
        </p>

        <ArticleHeading>
          Compare the existing policy with the renewal
        </ArticleHeading>

        <p>
          A simple factual comparison can make renewal changes easier to
          understand.
        </p>

        <RenewalTable />

        <p>
          This type of comparison shows the differences without determining
          whether a particular policy is appropriate for an individual
          customer.
        </p>

        <ArticleHeading>
          Documents worth keeping
        </ArticleHeading>

        <p>
          Keeping copies of previous and current policy documents can make
          future comparisons easier.
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Current insurance policy.</li>
          <li>Renewal notice.</li>
          <li>Policy schedule.</li>
          <li>Coverage summary.</li>
          <li>Previous premium information.</li>
          <li>Relevant claims information.</li>
        </ul>

        <ArticleHeading>
          Before accepting a renewal
        </ArticleHeading>

        <p>
          Reviewing the following items can help you understand the factual
          differences between the current policy and the renewal:
        </p>

        <ChecklistTable />

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
            Choose an insurance category, enter your information or upload an
            existing policy where available.
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

      {/* FOOTER */}
      <footer
        style={{
          background: "#020617",
          color: "#94a3b8",
          padding: "45px 7%",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <strong style={{ color: "#ffffff" }}>
            The Meta Insurance
          </strong>

          <a
            href="/blog"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
            }}
          >
            More insurance guides →
          </a>
        </div>
      </footer>
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

function RenewalTable() {
  const rows = [
    ["Annual premium", "€450", "€485", "+ €35"],
    ["Deductible", "€500", "€500", "Same"],
    ["Glass cover", "Included", "Included", "Same"],
    ["Roadside assistance", "Included", "Not included", "Removed"],
    ["Liability limit", "€1,000,000", "€1,500,000", "+ €500,000"],
  ];

  return (
    <div style={{ overflowX: "auto", margin: "28px 0" }}>
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

function ChecklistTable() {
  const rows = [
    ["Premium", "Has the price changed?"],
    ["Coverage limits", "Are the insured limits the same?"],
    ["Deductible", "Has the amount changed?"],
    ["Benefits", "Have any benefits been added or removed?"],
    ["Exclusions", "Are there new or changed exclusions?"],
    ["Personal details", "Is all policy information still accurate?"],
    ["Dates", "Are the expiry and renewal dates correct?"],
  ];

  return (
    <div style={{ overflowX: "auto", margin: "28px 0" }}>
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
