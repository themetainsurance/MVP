import type { Metadata } from "next";
import Link from "next/link";
import AdminMutationForm from "../../components/AdminMutationForm";
import { AdminPageHeader, EmptyState, formatAdminDate, formatAdminLabel, StatusBadge } from "../../components/AdminUi";
import { requireAdmin } from "../../../lib/admin-auth";
import { loadAdminReferralReport } from "../../../lib/partner-referral-admin";

export const metadata: Metadata = {
  title: "Referral reporting",
  description: "Protected operational reporting for outbound partner referrals.",
};

export default async function AdminReferralsPage() {
  await requireAdmin();
  const report = await loadAdminReferralReport();
  return (
    <>
      <AdminPageHeader eyebrow="REFERRALS" title="Outbound referral reporting" description="Operational, PII-free referral activity. A click is not a conversion and does not affect commission status." />
      {!report.available ? (
        <div className="admin-card"><EmptyState>Referral integration setup is not available yet.</EmptyState></div>
      ) : (
        <>
          <section className="admin-grid admin-grid-2" aria-label="Referral totals">
            <div className="admin-stat-card"><span>Outbound referrals</span><strong>{report.data.outboundReferrals}</strong></div>
            <div className="admin-stat-card"><span>Unique links used</span><strong>{report.data.uniqueLinksUsed}</strong></div>
          </section>
          <div className="admin-section admin-grid admin-grid-2">
            <section className="admin-card"><h2>Clicks by insurance type</h2><dl className="admin-compact-stats">{report.data.byInsuranceType.map((item) => <div key={item.insurance_type}><dt>{formatAdminLabel(item.insurance_type)}</dt><dd>{item.count}</dd></div>)}</dl>{!report.data.byInsuranceType.length ? <EmptyState>No referral clicks yet.</EmptyState> : null}</section>
            <section className="admin-card"><h2>Clicks by partner</h2><dl className="admin-compact-stats">{report.data.byPartner.map((item) => <div key={item.partner_id}><dt><Link className="admin-text-link" href={`/admin/partners/${item.partner_id}`}>{item.partner_name}</Link></dt><dd>{item.count}</dd></div>)}</dl>{!report.data.byPartner.length ? <EmptyState>No referral clicks yet.</EmptyState> : null}</section>
          </div>
          <section className="admin-section" aria-labelledby="recent-clicks-title">
            <div className="admin-section-heading"><h2 id="recent-clicks-title">Recent referral clicks</h2></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Created</th><th>Partner</th><th>Insurance</th><th>Status</th><th>Operational link</th></tr></thead><tbody>{report.data.recentClicks.map((click) => <tr key={click.id}><td>{formatAdminDate(click.created_at)}</td><td><Link className="admin-text-link" href={`/admin/partners/${click.partner_id}`}>{click.partner_name}</Link></td><td>{formatAdminLabel(click.insurance_type)}</td><td><StatusBadge value={click.redirect_status} /></td><td>{click.handoff_id ? <Link className="admin-text-link" href={`/admin/leads/${click.lead_id}`}>View handoff lead</Link> : click.comparison_id ? <Link className="admin-text-link" href={`/admin/comparisons/${click.comparison_id}`}>View comparison</Link> : "Generic"}</td></tr>)}</tbody></table>{!report.data.recentClicks.length ? <EmptyState>No referral clicks yet.</EmptyState> : null}</div>
          </section>
          <section className="admin-section" aria-labelledby="used-links-title">
            <div className="admin-section-heading"><h2 id="used-links-title">Recently created links</h2></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Created</th><th>Expires</th><th>Uses</th><th>Last used</th><th>Status</th><th>Action</th></tr></thead><tbody>{report.data.recentLinks.map((link) => <tr key={link.id}><td>{formatAdminDate(link.created_at)}</td><td>{formatAdminDate(link.expires_at)}</td><td>{link.used_count}</td><td>{formatAdminDate(link.last_used_at)}</td><td><StatusBadge value={link.revoked_at ? "revoked" : "active"} /></td><td>{!link.revoked_at ? <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/referral-links/${link.id}/revoke`} submitLabel="Revoke" confirmMessage="Revoke this referral link? This cannot be undone." /> : "Revoked"}</td></tr>)}</tbody></table>{!report.data.recentLinks.length ? <EmptyState>No used referral links yet.</EmptyState> : null}</div>
          </section>
        </>
      )}
    </>
  );
}
