import Link from "next/link";
import { requireAdmin } from "../../lib/admin-auth";
import "../admin.css";

const navigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/handoffs", label: "Handoffs" },
  { href: "/admin/conversions", label: "Conversions" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/blog", label: "Blog" },
];

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <Link className="admin-brand" href="/admin">
            The Meta Insurance
          </Link>
          <div className="admin-private-label">PRIVATE ADMINISTRATION</div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-identity">
            <strong>{admin.displayName ?? "Authorized administrator"}</strong>
            <br />
            {admin.role === "owner" ? "Owner" : "Admin"}
          </div>
          <form action="/api/admin/auth/logout" method="post">
            <button className="admin-signout" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
