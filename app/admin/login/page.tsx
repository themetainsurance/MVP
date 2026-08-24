import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "../../lib/admin-auth";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  description: "Private administrator sign in for The Meta Insurance.",
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main style={pageStyle}>
      <section style={panelStyle} aria-labelledby="admin-login-title">
        <a href="/" style={brandStyle}>
          The Meta Insurance
        </a>

        <div style={eyebrowStyle}>PRIVATE ADMINISTRATION</div>
        <h1 id="admin-login-title" style={titleStyle}>
          Administrator sign in
        </h1>
        <p style={descriptionStyle}>
          Use an authorized administrator account. Public registration is not
          available.
        </p>

        <AdminLoginForm />

        <p style={securityNoteStyle}>
          Authentication does not grant access by itself. Your account must also
          be active in the server-controlled administrator allowlist.
        </p>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "clamp(32px, 7vw, 80px) 7%",
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  background:
    "linear-gradient(135deg, #082f49 0%, #075985 55%, #0369a1 100%)",
};

const panelStyle: CSSProperties = {
  width: "100%",
  maxWidth: "470px",
  padding: "clamp(28px, 6vw, 46px)",
  boxSizing: "border-box",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  borderRadius: "18px",
  background: "#ffffff",
  boxShadow: "0 24px 70px rgba(2, 6, 23, 0.28)",
};

const brandStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: "34px",
  color: "#0f172a",
  fontSize: "20px",
  fontWeight: 800,
  letterSpacing: "-0.4px",
  textDecoration: "none",
};

const eyebrowStyle: CSSProperties = {
  marginBottom: "12px",
  color: "#0284c7",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.09em",
};

const titleStyle: CSSProperties = {
  margin: "0 0 14px",
  color: "#0f172a",
  fontSize: "clamp(30px, 6vw, 40px)",
  lineHeight: 1.12,
  letterSpacing: "-1px",
};

const descriptionStyle: CSSProperties = {
  margin: "0 0 28px",
  color: "#475569",
  fontSize: "15px",
  lineHeight: 1.7,
};

const securityNoteStyle: CSSProperties = {
  margin: "24px 0 0",
  paddingTop: "20px",
  borderTop: "1px solid #e2e8f0",
  color: "#64748b",
  fontSize: "12px",
  lineHeight: 1.65,
};
