const insuranceTypes = [
  {
    icon: "✈️",
    title: "Travel Insurance",
    description:
      "Compare travel insurance for single trips, multiple trips and worldwide cover.",
    href: "#travel",
  },
  {
    icon: "🚗",
    title: "Motor Insurance",
    description:
      "Find motor insurance based on your vehicle and coverage requirements.",
    href: "#motor",
  },
  {
    icon: "🏠",
    title: "Property Insurance",
    description:
      "Protect your home, apartment or property with the right level of cover.",
    href: "#property",
  },
];

export default function Home() {
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
          height: "72px",
          padding: "0 7%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
          }}
        >
          The Meta Insurance
        </div>

        <nav
          style={{
            display: "flex",
            gap: "28px",
            alignItems: "center",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <span>Insurance</span>
          <span>How it works</span>
          <span>Blog</span>
          <span>AI Assistant</span>

          <button
            style={{
              border: "none",
              background: "#0f172a",
              color: "white",
              padding: "11px 18px",
              borderRadius: "9px",
              fontWeight: 700,
            }}
          >
            Get insured
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #082f49 0%, #075985 55%, #0369a1 100%)",
          padding: "75px 7% 90px",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              maxWidth: "720px",
              marginBottom: "45px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "18px",
                color: "#bae6fd",
              }}
            >
              SMARTER INSURANCE STARTS HERE
            </div>

            <h1
              style={{
                fontSize: "56px",
                lineHeight: 1.05,
                margin: "0 0 20px",
                letterSpacing: "-2px",
              }}
            >
              Find the right insurance.
              <br />
              Without the complexity.
            </h1>

            <p
              style={{
                fontSize: "19px",
                lineHeight: 1.6,
                color: "#e0f2fe",
                maxWidth: "620px",
              }}
            >
              Compare insurance options, understand your coverage and find
              protection that fits your needs.
            </p>
          </div>

          {/* SEARCH / INSURANCE BOX */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "10px",
              maxWidth: "1050px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
                padding: "5px",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <InsuranceTab icon="✈️" title="Travel" active />
              <InsuranceTab icon="🚗" title="Motor" />
              <InsuranceTab icon="🏠" title="Property" />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr",
                gap: "8px",
              }}
            >
              <SearchField label="Destination" value="Where are you going?" />
              <SearchField label="Start date" value="Select date" />
              <SearchField label="End date" value="Select date" />

              <button
                style={{
                  background: "#0284c7",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INSURANCE TYPES */}
      <section
        style={{
          padding: "90px 7%",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: "42px" }}>
            <div
              style={{
                color: "#0284c7",
                fontSize: "14px",
                fontWeight: 800,
                marginBottom: "10px",
              }}
            >
              INSURANCE MADE SIMPLE
            </div>

            <h2
              style={{
                fontSize: "38px",
                margin: 0,
                letterSpacing: "-1px",
              }}
            >
              What would you like to insure?
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "22px",
            }}
          >
            {insuranceTypes.map((insurance) => (
              <InsuranceCard
                key={insurance.title}
                icon={insurance.icon}
                title={insurance.title}
                description={insurance.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{
          padding: "95px 7%",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "55px" }}>
            <h2
              style={{
                fontSize: "38px",
                marginBottom: "12px",
              }}
            >
              Insurance in three simple steps
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "17px",
              }}
            >
              No complicated forms. No confusing insurance language.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "40px",
            }}
          >
            <Step
              number="01"
              title="Tell us what you need"
              description="Enter your insurance requirements and basic details."
            />

            <Step
              number="02"
              title="Compare your options"
              description="Review available coverage and understand what each option includes."
            />

            <Step
              number="03"
              title="Choose your cover"
              description="Select the insurance option that best fits your needs."
            />
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section
        style={{
          padding: "40px 7% 100px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            background: "#0f172a",
            borderRadius: "24px",
            padding: "60px",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "50px",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <div
              style={{
                color: "#7dd3fc",
                fontWeight: 800,
                fontSize: "13px",
                marginBottom: "15px",
              }}
            >
              AI INSURANCE ASSISTANT
            </div>

            <h2
              style={{
                fontSize: "38px",
                margin: "0 0 18px",
              }}
            >
              Not sure what insurance you need?
            </h2>

            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.7,
                fontSize: "17px",
              }}
            >
              Tell our AI assistant what you want to protect. It will help
              collect the necessary information and guide you toward the right
              type of insurance.
            </p>
          </div>

          <button
            style={{
              background: "#ffffff",
              color: "#0f172a",
              border: "none",
              padding: "16px 24px",
              borderRadius: "10px",
              fontWeight: 800,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Ask AI Assistant →
          </button>
        </div>
      </section>

      {/* BLOG */}
      <section
        style={{
          padding: "80px 7%",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              marginBottom: "35px",
            }}
          >
            Insurance guides & advice
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "22px",
            }}
          >
            <BlogCard
              category="TRAVEL"
              title="What does travel insurance actually cover?"
            />

            <BlogCard
              category="MOTOR"
              title="How to choose the right motor insurance"
            />

            <BlogCard
              category="PROPERTY"
              title="Property insurance explained simply"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "45px 7%",
          background: "#020617",
          color: "#94a3b8",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <strong style={{ color: "white" }}>The Meta Insurance</strong>

          <span>Insurance made simpler.</span>
        </div>
      </footer>
    </main>
  );
}

function InsuranceTab({
  icon,
  title,
  active = false,
}: {
  icon: string;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      style={{
        border: "none",
        background: active ? "#e0f2fe" : "transparent",
        color: "#0f172a",
        padding: "12px 18px",
        borderRadius: "9px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {icon} {title}
    </button>
  );
}

function SearchField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        padding: "12px 15px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#0f172a",
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InsuranceCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "30px",
      }}
    >
      <div style={{ fontSize: "35px", marginBottom: "22px" }}>{icon}</div>

      <h3 style={{ fontSize: "21px", marginBottom: "12px" }}>{title}</h3>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.6,
          minHeight: "75px",
        }}
      >
        {description}
      </p>

      <button
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          color: "#0284c7",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Get a quote →
      </button>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div
        style={{
          color: "#0284c7",
          fontSize: "14px",
          fontWeight: 900,
          marginBottom: "15px",
        }}
      >
        {number}
      </div>

      <h3 style={{ fontSize: "21px" }}>{title}</h3>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function BlogCard({
  category,
  title,
}: {
  category: string;
  title: string;
}) {
  return (
    <article
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "15px",
        padding: "28px",
      }}
    >
      <div
        style={{
          color: "#0284c7",
          fontWeight: 800,
          fontSize: "12px",
          marginBottom: "18px",
        }}
      >
        {category}
      </div>

      <h3
        style={{
          fontSize: "20px",
          lineHeight: 1.4,
        }}
      >
        {title}
      </h3>

      <div
        style={{
          marginTop: "25px",
          fontWeight: 700,
        }}
      >
        Read guide →
      </div>
    </article>
  );
}
