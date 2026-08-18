import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Compare Insurance Policies | The Meta Insurance",
  description:
    "Learn how to compare insurance policies using premiums, coverage limits, deductibles, exclusions, additional benefits and policy terms.",
};

export default function CompareInsurancePoliciesPage() {
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
            INSURANCE COMPARISON GUIDE
          </div>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: "0 0 22px",
            }}
          >
            How to Compare Insurance Policies
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
            A practical guide to comparing premiums, coverage limits,
            deductibles, exclusions and additional benefits without focusing
            only on price.
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
          Insurance policies can look similar at first glance, especially when
          the annual premiums are close. However, two policies with the same
          price can have very different coverage limits, deductibles,
          exclusions and additional benefits.
        </p>

        <p>
          A useful comparison therefore looks at the factual differences
          between policy terms instead of considering the price alone.
        </p>

        <ArticleHeading>
          1. Compare the annual premium
        </ArticleHeading>

        <p>
          The annual premium is the amount charged for the insurance policy
          during the policy period.
        </p>

        <p>
          It is an important part of the comparison, but it should not be the
          only factor reviewed.
        </p>

        <InfoBox>
          A cheaper policy may have lower coverage limits, higher deductibles or
          fewer included benefits.
        </InfoBox>

        <ArticleHeading>
          2. Compare coverage limits
        </ArticleHeading>

        <p>
          Coverage limits define the maximum amount an insurer may pay for a
          particular type of eligible claim.
        </p>

        <p>
          Different parts of the same policy can have different limits.
        </p>

        <p>
          For example, a property policy may have one limit for the building,
          another for contents and another for personal liability.
        </p>

        <ArticleHeading>
          3. Compare the deductible or excess
        </ArticleHeading>

        <p>
          The deductible, sometimes called an excess, is the amount the insured
          person may need to pay toward an eligible claim before the remaining
          covered amount is paid by the insurer.
        </p>

        <p>
          A lower annual premium may sometimes be associated with a higher
          deductible.
        </p>

        <ArticleHeading>
          4. Compare what is included
        </ArticleHeading>

        <p>
          Some policies include additional benefits automatically while others
          require them to be added separately.
        </p>

        <p>
          Depending on the type of insurance, examples may include:
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Roadside assistance.</li>
          <li>Glass or windscreen cover.</li>
          <li>Alternative accommodation.</li>
          <li>Personal liability.</li>
          <li>Travel delay benefits.</li>
          <li>Baggage protection.</li>
          <li>Flood protection.</li>
          <li>Earthquake protection.</li>
        </ul>

        <ArticleHeading>
          5. Compare exclusions
        </ArticleHeading>

        <p>
          Exclusions describe situations, events or circumstances that are not
          covered by the policy.
        </p>

        <p>
          Policies that appear similar can contain materially different
          exclusions.
        </p>

        <InfoBox>
          Always review exclusions together with the list of covered benefits.
        </InfoBox>

        <ArticleHeading>
          6. Compare geographical coverage
        </ArticleHeading>

        <p>
          Some insurance products only apply within a specific country,
          territory or region.
        </p>

        <p>
          This can be particularly important for travel and motor insurance.
        </p>

        <ArticleHeading>
          7. Compare special conditions
        </ArticleHeading>

        <p>
          Policies may contain specific conditions that must be met for
          coverage to apply.
        </p>

        <p>
          Examples can include security requirements, reporting deadlines,
          approved repair networks or documentation requirements.
        </p>

        <ArticleHeading>
          8. Compare optional benefits separately
        </ArticleHeading>

        <p>
          Optional benefits can make two otherwise similar policies materially
          different.
        </p>

        <p>
          When comparing, it is useful to identify whether each benefit is:
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Included.</li>
          <li>Not included.</li>
          <li>Available as an optional extra.</li>
        </ul>

        <ArticleHeading>
          Example of a factual comparison
        </ArticleHeading>

        <p>
          Consider two motor insurance policies with the same annual premium:
        </p>

        <ComparisonExample />

        <p>
          In this example, the price is the same, but several factual terms are
          different.
        </p>

        <p>
          The alternative policy has a lower deductible, includes glass cover,
          includes roadside assistance and provides a higher liability limit.
        </p>

        <p>
          This does not automatically mean that one policy is suitable for every
          customer. It simply describes the factual differences between the two
          products.
        </p>

        <ArticleHeading>
          A simple comparison framework
        </ArticleHeading>

        <p>
          When reviewing two insurance options, a useful comparison can include:
        </p>

        <ComparisonFramework />

        <ArticleHeading>
          Why factual comparisons matter
        </ArticleHeading>

        <p>
          A factual comparison helps users understand what is actually changing
          between two insurance options.
        </p>

        <p>
          Instead of simply showing that one premium is cheaper, a comparison
          can highlight differences such as:
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Higher or lower insured limits.</li>
          <li>Higher or lower deductibles.</li>
          <li>Additional benefits.</li>
          <li>Removed benefits.</li>
          <li>Different exclusions.</li>
          <li>Different geographical coverage.</li>
        </ul>

        <ArticleHeading>
          What should not be assumed from a comparison?
        </ArticleHeading>

        <p>
          A factual comparison does not automatically determine which policy is
          the most appropriate for a particular person.
        </p>

        <p>
          Individual suitability can depend on personal circumstances,
          eligibility, needs and local insurance regulations.
        </p>

        <p>
          Final recommendations and regulated insurance advice should be
          provided by appropriately licensed insurance professionals where
          required.
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
            Ready to start an insurance request?
          </h2>

          <p style={{ marginTop: 0 }}>
            Choose your insurance category or use our assistant to provide your
            information step by step.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "22px",
            }}
          >
            <a href="/travel" style={primaryButton}>
              ✈️ Travel
            </a>

            <a href="/motor" style={primaryButton}>
              🚗 Motor
            </a>

            <a href="/property" style={primaryButton}>
              🏠 Property
            </a>

            <a
              href="/ai-assistant"
              style={{
                ...primaryButton,
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
          educational purposes only. The Meta Insurance provides technology,
          referral and factual comparison functionality and does not currently
          act as an insurance broker or insurer. This guide does not constitute
          regulated insurance advice or a recommendation to purchase a
          particular insurance product. Insurance terms, eligibility decisions,
          final offers and regulated advice are provided by licensed insurance
          partners.
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

function ComparisonExample() {
  const rows = [
    ["Annual premium", "€450", "€450", "Same"],
    ["Deductible", "€500", "€300", "Lower by €200"],
    ["Glass cover", "Not included", "Included", "Added"],
    ["Roadside assistance", "Not included", "Included", "Added"],
    ["Liability limit", "€1,000,000", "€2,000,000", "+ €1,000,000"],
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
              <td style={tdStyle}>{current}</td>
              <td style={tdStyle}>{alternative}</td>
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

function ComparisonFramework() {
  const rows = [
    ["Premium", "Same / Higher / Lower"],
    ["Coverage limit", "+ / - / Same"],
    ["Deductible", "Higher / Lower / Same"],
    ["Included benefits", "Added / Removed / Same"],
    ["Exclusions", "Different / Same"],
    ["Territory", "Broader / Narrower / Same"],
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
            <th style={thStyle}>Comparison point</th>
            <th style={thStyle}>Possible factual result</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(([point, result]) => (
            <tr key={point}>
              <td style={tdStyle}>
                <strong>{point}</strong>
              </td>
              <td style={tdStyle}>{result}</td>
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

const primaryButton = {
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
