import type { Metadata } from "next";
import BrandLogo from "../../components/BrandLogo";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "What Does Travel Insurance Cover? | The Meta Insurance",
  description:
    "Learn what travel insurance commonly covers, including emergency medical expenses, trip cancellation, baggage, delays and important exclusions.",

  alternates: {
    canonical: "/blog/travel-insurance-guide",
  },

  openGraph: {
    title: "What Does Travel Insurance Cover? | The Meta Insurance",
    description:
      "Learn what travel insurance commonly covers, including emergency medical expenses, trip cancellation, baggage, delays and important exclusions.",
    url: "/blog/travel-insurance-guide",
    type: "article",
  },

  twitter: {
    card: "summary",
    title: "What Does Travel Insurance Cover? | The Meta Insurance",
    description:
      "Learn about common travel insurance coverage, exclusions and policy details.",
  },
};

export default function TravelInsuranceGuidePage() {
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
          <a href="/travel" style={navStyle}>
            Travel Insurance
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

      {/* ARTICLE HERO */}
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
            TRAVEL INSURANCE GUIDE
          </div>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: "0 0 22px",
            }}
          >
            What Does Travel Insurance Cover?
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
            A simple guide to common travel insurance benefits, limits,
            deductibles and exclusions.
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
          Travel insurance is designed to provide financial protection against
          certain unexpected events that may happen before or during a trip.
          The exact coverage depends on the insurance policy, insurer, country,
          destination and level of protection selected.
        </p>

        <p>
          Because policies can vary significantly, it is important to review
          the policy wording, coverage limits, deductibles and exclusions before
          making a decision.
        </p>

        <ArticleHeading>
          1. Emergency medical expenses
        </ArticleHeading>

        <p>
          One of the most common parts of travel insurance is emergency medical
          coverage while travelling abroad.
        </p>

        <p>
          Depending on the policy, this may include treatment for unexpected
          illness or accidental injury, hospital expenses, emergency medical
          procedures and certain prescribed medicines.
        </p>

        <InfoBox>
          Always check the maximum medical coverage limit and whether a
          deductible applies.
        </InfoBox>

        <ArticleHeading>
          2. Emergency medical evacuation
        </ArticleHeading>

        <p>
          Some policies may cover emergency transportation when appropriate
          medical treatment is not available at the traveller&apos;s location.
        </p>

        <p>
          This can include transportation to a suitable medical facility or,
          depending on the policy terms, repatriation to the traveller&apos;s
          home country.
        </p>

        <ArticleHeading>
          3. Trip cancellation
        </ArticleHeading>

        <p>
          Trip cancellation coverage may reimburse certain prepaid,
          non-refundable travel costs when a trip must be cancelled for a
          reason specifically covered by the policy.
        </p>

        <p>
          Covered reasons can vary considerably between insurance products.
          Travellers should therefore check exactly which circumstances are
          included.
        </p>

        <ArticleHeading>
          4. Trip interruption
        </ArticleHeading>

        <p>
          Trip interruption coverage may apply when a traveller has already
          started a trip but needs to return home early because of an eligible
          event.
        </p>

        <p>
          Depending on the policy, this may include certain unused travel costs
          or additional transportation expenses.
        </p>

        <ArticleHeading>
          5. Lost, stolen or damaged baggage
        </ArticleHeading>

        <p>
          Travel insurance may provide compensation if baggage or personal
          belongings are lost, stolen or damaged during a trip.
        </p>

        <p>
          Policies usually contain individual item limits and exclusions for
          certain high-value belongings such as electronics, jewellery or
          specialist equipment.
        </p>

        <ArticleHeading>
          6. Baggage delay
        </ArticleHeading>

        <p>
          If checked baggage is delayed for a specified period, some travel
          insurance policies may reimburse essential purchases such as basic
          clothing and toiletries.
        </p>

        <p>
          The minimum delay period and maximum reimbursement amount vary by
          policy.
        </p>

        <ArticleHeading>
          7. Travel delay
        </ArticleHeading>

        <p>
          Certain policies may cover additional expenses resulting from a
          qualifying travel delay.
        </p>

        <p>
          This could include meals, accommodation or transportation, subject to
          policy limits and minimum delay periods.
        </p>

        <ArticleHeading>
          8. Personal liability
        </ArticleHeading>

        <p>
          Some travel policies include personal liability protection if the
          insured traveller accidentally causes injury to another person or
          damage to their property.
        </p>

        <ArticleHeading>
          What might not be covered?
        </ArticleHeading>

        <p>
          Travel insurance policies also contain exclusions. These can vary,
          but commonly excluded or restricted situations may include:
        </p>

        <ul
          style={{
            paddingLeft: "24px",
          }}
        >
          <li>Pre-existing medical conditions unless specifically covered.</li>
          <li>Events known before the policy was purchased.</li>
          <li>Certain high-risk sports or activities.</li>
          <li>Claims involving alcohol or illegal substances.</li>
          <li>Travel against official restrictions or policy conditions.</li>
          <li>Unattended baggage or valuables.</li>
          <li>Losses above stated policy limits.</li>
        </ul>

        <ArticleHeading>
          Single-trip vs annual travel insurance
        </ArticleHeading>

        <p>
          Single-trip insurance generally covers one specific journey during a
          defined period.
        </p>

        <p>
          Annual or multi-trip insurance can cover multiple eligible journeys
          during a policy year, usually subject to a maximum duration for each
          individual trip.
        </p>

        <ArticleHeading>
          What should you compare?
        </ArticleHeading>

        <p>
          Comparing travel insurance is not only about finding the lowest
          premium. Useful factual points to compare include:
        </p>

        <ComparisonTable />

        <ArticleHeading>
          Before submitting a travel insurance request
        </ArticleHeading>

        <p>
          Having the following information available can make the process
          easier:
        </p>

        <ul
          style={{
            paddingLeft: "24px",
          }}
        >
          <li>Country of residence.</li>
          <li>Destination or travel region.</li>
          <li>Departure and return dates.</li>
          <li>Number and ages of travellers.</li>
          <li>Purpose of the trip.</li>
          <li>Any specific activities planned.</li>
          <li>Preferred coverage requirements.</li>
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
            Looking for travel insurance?
          </h2>

          <p
            style={{
              marginTop: 0,
            }}
          >
            Enter your travel details and submit your request to relevant
            licensed insurance partners.
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
              href="/travel"
              style={{
                background: "#0284c7",
                color: "#ffffff",
                padding: "13px 18px",
                borderRadius: "9px",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Start Travel Request →
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
          educational purposes only. It does not constitute regulated
          insurance advice or a recommendation to purchase a particular
          insurance product. Coverage varies by insurer and policy. Final
          insurance terms, eligibility, offers and regulated advice are
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
    ["Medical expenses", "Maximum coverage limit"],
    ["Trip cancellation", "Covered reasons and maximum benefit"],
    ["Baggage", "Overall and per-item limits"],
    ["Deductible", "Amount paid by the insured before coverage applies"],
    ["Travel delay", "Minimum delay period and reimbursement limit"],
    ["Activities", "Sports and activities included or excluded"],
    ["Territory", "Countries or regions covered"],
    ["Exclusions", "Events and circumstances not covered"],
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
              What to check
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
