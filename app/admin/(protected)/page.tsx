import type { Metadata } from "next";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Admin",
  description: "Private administrator area for The Meta Insurance.",
};

export default function AdminPage() {
  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <strong style={brandStyle}>The Meta Insurance</strong>

        <form action="/api/admin/auth/logout" method="post">
          <button type="submit" style={signOutButtonStyle}>
            Sign out
          </button>
        </form>
      </header>

      <section style={contentStyle}>
        <div style={eyebrowStyle}>PRIVATE ADMINISTRATION</div>
        <h1 style={titleStyle}>The Meta Insurance Admin</h1>
        <p style={descriptionStyle}>Admin access verified.</p>

        <div style={placeholderStyle}>
          <strong style={placeholderTitleStyle}>Secure foundation ready</strong>
          <p style={placeholderTextStyle}>
            Operational dashboard features will be added separately. This page
            currently confirms authenticated, allowlisted administrator access.
          </p>
        </div>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  color: "#0f172a",
};

const headerStyle: CSSProperties = {
  minHeight: "72px",
  padding: "0 7%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  borderBottom: "1px solid #e2e8f0",
  background: "#ffffff",
};

const brandStyle: CSSProperties = {
  fontSize: "20px",
  fontWeight: 800,
  letterSpacing: "-0.4px",
};

const signOutButtonStyle: CSSProperties = {
  minHeight: "42px",
  padding: "0 17px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#334155",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 800,
};

const contentStyle: CSSProperties = {
  width: "min(900px, 86%)",
  margin: "0 auto",
  padding: "clamp(58px, 10vw, 110px) 0",
};

const eyebrowStyle: CSSProperties = {
  marginBottom: "14px",
  color: "#0284c7",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.09em",
};

const titleStyle: CSSProperties = {
  margin: "0 0 16px",
  fontSize: "clamp(38px, 7vw, 58px)",
  lineHeight: 1.08,
  letterSpacing: "-1.8px",
};

const descriptionStyle: CSSProperties = {
  margin: "0 0 40px",
  color: "#475569",
  fontSize: "18px",
  lineHeight: 1.7,
};

const placeholderStyle: CSSProperties = {
  padding: "clamp(26px, 5vw, 40px)",
  border: "1px solid #bae6fd",
  borderRadius: "16px",
  background: "#f0f9ff",
};

const placeholderTitleStyle: CSSProperties = {
  display: "block",
  marginBottom: "10px",
  color: "#0c4a6e",
  fontSize: "20px",
};

const placeholderTextStyle: CSSProperties = {
  maxWidth: "680px",
  margin: 0,
  color: "#075985",
  fontSize: "15px",
  lineHeight: 1.7,
};
