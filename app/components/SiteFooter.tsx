import type { CSSProperties } from "react";

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/travel", label: "Travel" },
  { href: "/motor", label: "Motor" },
  { href: "/property", label: "Property" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/blog", label: "Blog" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
  { href: "/contact", label: "Contact" },
];

export default function SiteFooter() {
  return (
    <footer style={footerStyle}>
      <div style={footerInnerStyle}>
        <div style={brandColumnStyle}>
          <strong style={brandStyle}>
            The Meta Insurance
          </strong>
          <p style={platformStatementStyle}>
            The Meta Insurance is a technology, referral and affiliate platform.
          </p>
        </div>

        <FooterNavigation label="Explore" links={exploreLinks} />
        <FooterNavigation label="Legal & Trust" links={legalLinks} />
      </div>
    </footer>
  );
}

function FooterNavigation({
  label,
  links,
}: {
  label: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={`${label} footer navigation`}>
      <strong style={groupHeadingStyle}>{label}</strong>
      <div style={linksStyle}>
        {links.map((link) => (
          <a key={link.href} href={link.href} style={linkStyle}>
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

const footerStyle: CSSProperties = {
  background: "#020617",
  color: "#94a3b8",
  padding: "48px 7%",
};

const footerInnerStyle: CSSProperties = {
  maxWidth: "1180px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "36px",
  alignItems: "start",
};

const brandColumnStyle: CSSProperties = {
  maxWidth: "380px",
};

const brandStyle: CSSProperties = {
  color: "#ffffff",
  display: "inline-block",
  fontSize: "18px",
  fontWeight: 800,
  marginBottom: "10px",
  textDecoration: "none",
};

const platformStatementStyle: CSSProperties = {
  lineHeight: 1.65,
  margin: 0,
};

const groupHeadingStyle: CSSProperties = {
  color: "#ffffff",
  display: "block",
  marginBottom: "12px",
};

const linksStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px 20px",
};

const linkStyle: CSSProperties = {
  color: "#cbd5e1",
  lineHeight: 1.5,
  textDecoration: "none",
};
