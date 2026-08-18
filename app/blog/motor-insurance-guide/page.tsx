import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Motor Insurance Coverage Explained | The Meta Insurance",
  description:
    "Learn how motor insurance coverage works, including liability, collision, comprehensive cover, deductibles, glass, theft, roadside assistance and exclusions.",

  alternates: {
    canonical: "/blog/motor-insurance-guide",
  },

  openGraph: {
    title: "Motor Insurance Coverage Explained | The Meta Insurance",
    description:
      "Learn how motor insurance coverage works, including liability, collision, comprehensive cover, deductibles, glass, theft, roadside assistance and exclusions.",
    url: "/blog/motor-insurance-guide",
    type: "article",
  },

  twitter: {
    card: "summary",
    title: "Motor Insurance Coverage Explained | The Meta Insurance",
    description:
      "Learn about common motor insurance coverage, deductibles, optional protection and exclusions.",
  },
};

export default function MotorInsuranceGuidePage() {
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
          <a href="/motor" style={navStyle}>
            Motor Insurance
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
            MOTOR INSURANCE GUIDE
          </div>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: "0 0 22px",
            }}
          >
            How to Understand Motor Insurance Coverage
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
            A simple guide to common motor insurance coverage, deductibles,
            limits, optional benefits and exclusions.
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
          Motor insurance can include several different types of protection.
          The exact coverage depends on the insurer, policy type, vehicle,
          country and selected level of protection.
        </p>

        <p>
          Two motor insurance policies with a similar annual premium can still
          have important differences in coverage limits, deductibles,
          exclusions and additional benefits.
        </p>

        <ArticleHeading>
          1. Third-party liability
        </ArticleHeading>

        <p>
          Third-party liability insurance generally covers legal liability for
          injury or property damage caused to other people when the insured
          driver is responsible for an accident.
        </p>

        <p>
          In many jurisdictions, some level of motor liability insurance is
          required by law. Requirements and minimum limits vary by country.
        </p>

        <InfoBox>
          Check the liability limit and whether different limits apply to bodily
          injury and property damage.
        </InfoBox>

        <ArticleHeading>
          2. Damage to your own vehicle
        </ArticleHeading>

        <p>
          Depending on the policy, coverage may also apply to accidental damage
          to the insured vehicle.
        </p>

        <p>
          This type of protection may cover damage following a collision,
          subject to the policy terms, deductible and exclusions.
        </p>

        <ArticleHeading>
          3. Comprehensive coverage
        </ArticleHeading>

        <p>
          Comprehensive motor insurance may provide broader protection than
          basic liability coverage.
        </p>

        <p>
          Depending on the insurer and policy, this may include risks such as
          theft, fire, vandalism, weather-related damage, falling objects and
          other insured events.
        </p>

        <ArticleHeading>
          4. Deductible or excess
        </ArticleHeading>

        <p>
          A deductible, sometimes called an excess, is the amount the insured
          person may need to pay toward a covered claim before the insurer pays
          the remaining eligible amount.
        </p>

        <p>
          A policy with a lower premium may sometimes have a higher deductible,
          so comparing only the annual price can be misleading.
        </p>

        <InfoBox>
          Compare both the annual premium and the deductible before evaluating
          the financial difference between policies.
        </InfoBox>

        <ArticleHeading>
          5. Glass and windscreen cover
        </ArticleHeading>

        <p>
          Some motor insurance policies include separate coverage for damage to
          the windscreen, windows or other vehicle glass.
        </p>

        <p>
          There may be a specific limit, deductible or number of claims allowed
          during the policy period.
        </p>

        <ArticleHeading>
          6. Theft protection
        </ArticleHeading>

        <p>
          Depending on the policy, theft coverage may provide financial
          protection if the insured vehicle is stolen or damaged during an
          attempted theft.
        </p>

        <p>
          Conditions may apply regarding vehicle security systems, keys,
          parking locations and police reporting.
        </p>

        <ArticleHeading>
          7. Fire damage
        </ArticleHeading>

        <p>
          Some policies provide protection against damage caused by fire,
          explosion or related insured events.
        </p>

        <p>
          Coverage limits and exclusions should always be checked in the policy
          wording.
        </p>

        <ArticleHeading>
          8. Roadside assistance
        </ArticleHeading>

        <p>
          Roadside assistance may be included automatically or offered as an
          optional benefit.
        </p>

        <p>
          Depending on the product, it may include towing, battery assistance,
          tyre support, emergency fuel delivery or help following a breakdown.
        </p>

        <ArticleHeading>
          9. Replacement vehicle
        </ArticleHeading>

        <p>
          Some motor policies may provide a temporary replacement vehicle while
          the insured vehicle is being repaired following an eligible claim.
        </p>

        <p>
          The maximum number of days and vehicle category may differ between
          insurance products.
        </p>

        <ArticleHeading>
          10. Personal accident cover
        </ArticleHeading>

        <p>
          Some motor insurance products may include or optionally offer
          personal accident benefits for the driver or passengers.
        </p>

        <p>
          Coverage conditions, insured persons and maximum benefits vary by
          policy.
        </p>

        <ArticleHeading>
          What may not be covered?
        </ArticleHeading>

        <p>
          Motor insurance policies contain exclusions and conditions. Depending
          on the policy, examples may include:
        </p>

        <ul
          style={{
            paddingLeft: "24px",
          }}
        >
          <li>Driving without a valid licence.</li>
          <li>Driving under the influence of alcohol or illegal substances.</li>
          <li>Intentional damage.</li>
          <li>Use of the vehicle outside permitted purposes.</li>
          <li>Unapproved or undeclared vehicle modifications.</li>
          <li>Normal wear and tear or mechanical failure.</li>
          <li>Damage outside the insured geographical territory.</li>
          <li>Claims exceeding policy limits.</li>
        </ul>

        <ArticleHeading>
          What information can affect motor insurance?
        </ArticleHeading>

        <p>
          Insurers may consider a range of information when assessing a motor
          insurance request, depending on the local market and applicable
          rules.
        </p>

        <ul
          style={{
            paddingLeft: "24px",
          }}
        >
          <li>Vehicle make and model.</li>
          <li>Year of manufacture.</li>
          <li>Engine size or power.</li>
          <li>Fuel type.</li>
          <li>Vehicle value.</li>
          <li>Vehicle usage.</li>
          <li>Driver information.</li>
          <li>Claims history.</li>
          <li>Location.</li>
          <li>Requested coverage level.</li>
        </ul>

        <ArticleHeading>
          How to compare two motor insurance policies
        </ArticleHeading>

        <p>
          The annual premium is only one part of a motor insurance comparison.
          A factual comparison can also look at the following:
        </p>

        <ComparisonTable />

        <ArticleHeading>
          Example of a factual comparison
        </ArticleHeading>

        <p>
          Imagine two motor insurance policies both cost €450 per year.
        </p>

        <ExampleBox />

        <p>
          In this example, the annual premium is the same, but the coverage is
          not identical. The second policy has additional benefits and a lower
          deductible.
        </p>

        <p>
          This does not automatically mean that one policy is suitable for
          every customer. It simply shows the factual differences between the
          two sets of terms.
        </p>

        <ArticleHeading>
          Before submitting a motor insurance request
        </ArticleHeading>

        <p>
          Having the following information ready can make the process easier:
        </p>

        <ul
          style={{
            paddingLeft: "24px",
          }}
        >
          <li>Vehicle make and model.</li>
          <li>Year of manufacture.</li>
          <li>Fuel type.</li>
          <li>Engine power or capacity.</li>
          <li>Estimated vehicle value.</li>
          <li>Current insurer, if applicable.</li>
          <li>Current annual premium, if known.</li>
          <li>Current deductible, if known.</li>
          <li>Existing policy document, if available.</li>
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
            Looking for motor insurance?
          </h2>

          <p
            style={{
              marginTop: 0,
            }}
          >
            Enter your vehicle information manually or upload an existing
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
              href="/motor"
              style={{
                background: "#0284c7",
                color: "#ffffff",
                padding: "13px 18px",
                borderRadius: "9px",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Start Motor Request →
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
          <strong
            style={{
              color: "#ffffff",
            }}
          >
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

function ComparisonTable() {
  const rows = [
    ["Annual premium", "Total yearly price"],
    ["Liability", "Coverage limits for third-party claims"],
    ["Own vehicle damage", "Whether damage to the insured vehicle is covered"],
    ["Deductible", "Amount the customer may pay toward a covered claim"],
    ["Glass", "Windscreen and window coverage and limits"],
    ["Theft", "Whether theft or attempted theft is included"],
    ["Fire", "Whether fire damage is included"],
    ["Roadside assistance", "Included services and geographical limits"],
    ["Replacement vehicle", "Availability and maximum number of days"],
    ["Territory", "Countries where the policy is valid"],
    ["Exclusions", "Situations and events not covered"],
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
            <th style={thStyle}>
              Feature
            </th>

            <th style={thStyle}>
              What to compare
            </th>
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

function ExampleBox() {
  const rows = [
    ["Annual premium", "€450", "€450", "Same"],
    ["Deductible", "€500", "€300", "Lower"],
    ["Glass cover", "Not included", "Included", "Added"],
    ["Roadside assistance", "Not included", "Included", "Added"],
    ["Theft cover", "Included", "Included", "Same"],
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
