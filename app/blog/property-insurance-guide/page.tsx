import type { Metadata } from "next";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Property Insurance Explained Simply | The Meta Insurance",
  description:
    "Learn how property insurance works, including building cover, contents insurance, liability, flood, earthquake, deductibles, exclusions and policy comparisons.",

  alternates: {
    canonical: "/blog/property-insurance-guide",
  },

  openGraph: {
    title: "Property Insurance Explained Simply | The Meta Insurance",
    description:
      "Learn how property insurance works, including building cover, contents insurance, liability, flood, earthquake, deductibles, exclusions and policy comparisons.",
    url: "/blog/property-insurance-guide",
    type: "article",
  },

  twitter: {
    card: "summary",
    title: "Property Insurance Explained Simply | The Meta Insurance",
    description:
      "Learn about building cover, contents insurance, liability, deductibles and common exclusions.",
  },
};

export default function PropertyInsuranceGuidePage() {
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
          <a href="/property" style={navStyle}>
            Property Insurance
          </a>

          <a href="/blog" style={navStyle}>
            Insurance Guides
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
            PROPERTY INSURANCE GUIDE
          </div>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: "0 0 22px",
            }}
          >
            Property Insurance Explained Simply
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
            Understand common property insurance coverage, limits,
            deductibles, exclusions and the differences between policies.
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
          Property insurance can provide financial protection for a home,
          apartment or other insured property against certain unexpected
          events.
        </p>

        <p>
          The exact protection depends on the insurer and policy. Coverage can
          include the building itself, personal belongings, liability and
          additional risks such as flood or earthquake.
        </p>

        <ArticleHeading>
          1. Building insurance
        </ArticleHeading>

        <p>
          Building insurance generally relates to the physical structure of
          the insured property.
        </p>

        <p>
          Depending on the policy, this can include walls, floors, ceilings,
          roofs and permanently installed fixtures.
        </p>

        <InfoBox>
          Check the maximum insured value of the building and whether that
          amount reflects the cost of rebuilding the property.
        </InfoBox>

        <ArticleHeading>
          2. Contents insurance
        </ArticleHeading>

        <p>
          Contents insurance can cover certain belongings kept inside the
          insured property.
        </p>

        <p>
          Examples can include furniture, appliances, clothing and other
          personal possessions, subject to policy limits and exclusions.
        </p>

        <p>
          Expensive items may have separate individual limits.
        </p>

        <ArticleHeading>
          3. Fire and smoke
        </ArticleHeading>

        <p>
          Many property insurance policies provide protection against eligible
          damage caused by fire and smoke.
        </p>

        <p>
          The amount payable depends on the insured limits, deductible and
          circumstances of the claim.
        </p>

        <ArticleHeading>
          4. Water damage
        </ArticleHeading>

        <p>
          Some policies provide protection for certain types of sudden water
          damage, such as water escaping from internal pipes.
        </p>

        <p>
          Gradual deterioration, poor maintenance and certain other causes may
          be excluded.
        </p>

        <ArticleHeading>
          5. Flood insurance
        </ArticleHeading>

        <p>
          Flood coverage may be included in some property policies, offered as
          an optional benefit or excluded entirely.
        </p>

        <p>
          Policies may have a separate flood limit and a different deductible
          from other types of claims.
        </p>

        <InfoBox>
          Do not assume that flood protection is automatically included. Check
          the policy wording and stated limits.
        </InfoBox>

        <ArticleHeading>
          6. Earthquake insurance
        </ArticleHeading>

        <p>
          Earthquake protection can vary significantly between insurers and
          geographical locations.
        </p>

        <p>
          Some policies include earthquake cover, while others require it to be
          added separately.
        </p>

        <p>
          A specific deductible may apply to earthquake claims.
        </p>

        <ArticleHeading>
          7. Theft and burglary
        </ArticleHeading>

        <p>
          Property insurance may cover eligible loss or damage following theft
          or burglary.
        </p>

        <p>
          Conditions can apply regarding locks, security systems, windows,
          occupancy and police reports.
        </p>

        <ArticleHeading>
          8. Personal liability
        </ArticleHeading>

        <p>
          Some property insurance policies include personal liability
          protection.
        </p>

        <p>
          This may provide protection in certain circumstances where the
          insured person becomes legally liable for injury to another person or
          damage to another person&apos;s property.
        </p>

        <ArticleHeading>
          9. Alternative accommodation
        </ArticleHeading>

        <p>
          If an insured property becomes temporarily uninhabitable following a
          covered event, some policies may contribute toward alternative
          accommodation.
        </p>

        <p>
          Maximum amounts and time periods normally apply.
        </p>

        <ArticleHeading>
          10. Accidental damage
        </ArticleHeading>

        <p>
          Accidental damage is not automatically included in every property
          insurance policy.
        </p>

        <p>
          It may be available as an additional benefit depending on the insurer
          and policy.
        </p>

        <ArticleHeading>
          What may not be covered?
        </ArticleHeading>

        <p>
          Property insurance policies contain exclusions. Depending on the
          policy, examples may include:
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Normal wear and tear.</li>
          <li>Damage caused by poor maintenance.</li>
          <li>Gradual water leakage.</li>
          <li>Certain natural disasters unless specifically included.</li>
          <li>Intentional damage.</li>
          <li>Unoccupied properties beyond permitted periods.</li>
          <li>Commercial activities not declared to the insurer.</li>
          <li>Losses above the stated policy limits.</li>
        </ul>

        <ArticleHeading>
          Understanding the deductible
        </ArticleHeading>

        <p>
          The deductible is the amount the insured person may have to pay
          toward an eligible claim before the insurer pays the remaining
          covered amount.
        </p>

        <p>
          Different risks can sometimes have different deductibles.
        </p>

        <p>
          For example, a policy might have a €250 general deductible but a
          €1,000 earthquake deductible.
        </p>

        <ArticleHeading>
          What information can affect property insurance?
        </ArticleHeading>

        <p>
          Insurers may request information such as:
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Property type.</li>
          <li>Property use.</li>
          <li>Country and city.</li>
          <li>Year of construction.</li>
          <li>Property size.</li>
          <li>Construction materials.</li>
          <li>Estimated building value.</li>
          <li>Estimated contents value.</li>
          <li>Security systems.</li>
          <li>Previous claims.</li>
          <li>Requested coverage.</li>
        </ul>

        <ArticleHeading>
          How to compare property insurance policies
        </ArticleHeading>

        <p>
          Comparing only the annual premium does not show the complete
          difference between two property insurance policies.
        </p>

        <p>
          Useful factual points to compare include:
        </p>

        <ComparisonTable />

        <ArticleHeading>
          Example of a factual comparison
        </ArticleHeading>

        <p>
          Imagine that two property insurance options both have an annual
          premium of €220.
        </p>

        <ExampleTable />

        <p>
          In this example the premium is identical, but the second policy has
          higher insured limits and includes additional protection.
        </p>

        <p>
          This is a factual comparison of policy terms. It does not mean that
          one policy is automatically suitable for every customer.
        </p>

        <ArticleHeading>
          Before submitting a property insurance request
        </ArticleHeading>

        <p>
          Having the following information ready can make the process easier:
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Property address or location.</li>
          <li>Property type.</li>
          <li>Year of construction.</li>
          <li>Approximate property size.</li>
          <li>Estimated building value.</li>
          <li>Estimated contents value.</li>
          <li>Current insurer, if applicable.</li>
          <li>Current premium and deductible, if known.</li>
          <li>Existing property insurance policy, if available.</li>
        </ul>

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
            Looking for property insurance?
          </h2>

          <p style={{ marginTop: 0 }}>
            Enter your property information manually or upload an existing
            policy and submit your request to relevant licensed insurance
            partners.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "22px",
            }}
          >
            <a
              href="/property"
              style={{
                background: "#0284c7",
                color: "#ffffff",
                padding: "13px 18px",
                borderRadius: "9px",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Start Property Request →
            </a>

            <a
              href="/ai-assistant"
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "13px 18px",
                borderRadius: "9px",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Use AI Assistant
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
          advice or a recommendation to purchase a particular insurance
          product. Coverage varies by insurer and policy. Final insurance
          terms, eligibility decisions, offers and regulated advice are
          provided by licensed insurance partners.
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

function ComparisonTable() {
  const rows = [
    ["Annual premium", "Total yearly price"],
    ["Building cover", "Maximum insured value of the structure"],
    ["Contents cover", "Maximum insured value of belongings"],
    ["Deductible", "Amount payable toward an eligible claim"],
    ["Fire", "Whether fire and smoke damage is included"],
    ["Flood", "Coverage, limits and deductible"],
    ["Earthquake", "Whether included and any special deductible"],
    ["Theft", "Coverage limits and security requirements"],
    ["Liability", "Maximum personal liability protection"],
    ["Accommodation", "Maximum alternative accommodation benefit"],
    ["Exclusions", "Events and circumstances not covered"],
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
            <th style={thStyle}>What to compare</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(([feature, check]) => (
            <tr key={feature}>
              <td style={tdStyle}>
                <strong>{feature}</strong>
              </td>

              <td style={tdStyle}>
                {check}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExampleTable() {
  const rows = [
    ["Annual premium", "€220", "€220", "Same"],
    ["Building cover", "€100,000", "€120,000", "+ €20,000"],
    ["Contents cover", "€20,000", "€30,000", "+ €10,000"],
    ["Earthquake", "Not included", "Included", "Added"],
    ["Personal liability", "€25,000", "€50,000", "+ €25,000"],
    ["Alternative accommodation", "Not included", "Included", "Added"],
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
            <th style={thStyle}>Alternative policy</th>
            <th style={thStyle}>Difference</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(([feature, current, alternative, difference]) => (
            <tr key={feature}>
              <td style={tdStyle}>
                <strong>{feature}</strong>
              </td>

              <td style={tdStyle}>
                {current}
              </td>

              <td style={tdStyle}>
                {alternative}
              </td>

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

const navStyle = {
  color: "#0f172a",
  textDecoration: "none",
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
