export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      <header
        style={{
          background: "#ffffff",
          padding: "20px 8%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <strong style={{ fontSize: "24px" }}>
          The Meta Insurance
        </strong>

        <nav>
          <span style={{ marginRight: "25px" }}>Insurance</span>
          <span style={{ marginRight: "25px" }}>Blog</span>
          <span>AI Assistant</span>
        </nav>
      </header>

      <section
        style={{
          padding: "90px 8%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "15px",
          }}
        >
          Find the right insurance for you
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#6b7280",
            marginBottom: "50px",
          }}
        >
          Compare insurance options quickly and easily.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <InsuranceCard
            icon="✈️"
            title="Travel Insurance"
            description="Protect your next trip."
          />

          <InsuranceCard
            icon="🚗"
            title="Motor Insurance"
            description="Find cover for your vehicle."
          />

          <InsuranceCard
            icon="🏠"
            title="Property Insurance"
            description="Protect your home and property."
          />
        </div>
      </section>
    </main>
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
        width: "260px",
        background: "#ffffff",
        padding: "30px",
        borderRadius: "16px",
        textAlign: "left",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: "36px" }}>{icon}</div>

      <h2>{title}</h2>

      <p style={{ color: "#6b7280" }}>
        {description}
      </p>

      <button
        style={{
          marginTop: "15px",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#111827",
          color: "#ffffff",
          cursor: "pointer",
        }}
      >
        Get started
      </button>
    </div>
  );
}
