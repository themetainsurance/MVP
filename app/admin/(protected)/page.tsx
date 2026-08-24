import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageHeader,
  EmptyState,
  embeddedOne,
  formatAdminDate,
  formatAdminLabel,
  formatCommission,
  StatusBadge,
} from "../components/AdminUi";
import { requireAdmin } from "../../lib/admin-auth";
import { loadAdminDashboard } from "../../lib/admin-dashboard-data";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Private operational dashboard for The Meta Insurance.",
};

export default async function AdminPage() {
  await requireAdmin();
  const data = await loadAdminDashboard();

  const leadStats = [
    ["Total leads", data.totalLeads],
    ["New leads", data.newLeads],
    ["Reviewing", data.reviewingLeads],
    ["Sent to partner", data.sentToPartnerLeads],
    ["Completed", data.completedLeads],
  ] as const;
  const operations = [
    ["Active partners", data.activePartners],
    ["Pending handoffs", data.pendingHandoffs],
    ["Sent handoffs", data.sentHandoffs],
    ["Pending conversions", data.pendingConversions],
    ["Confirmed conversions", data.confirmedConversions],
    ["Pending commissions", data.pendingCommissions],
    ["Approved commissions", data.approvedCommissions],
    ["Paid commissions", data.paidCommissions],
  ] as const;

  return (
    <>
      <AdminPageHeader
        eyebrow="OPERATIONS"
        title="Dashboard"
        description="A current operational view of insurance requests, partner handoffs, conversions and commission lifecycle records."
      />

      <section aria-labelledby="lead-summary-title">
        <div className="admin-section-heading">
          <h2 id="lead-summary-title">Lead summary</h2>
          <Link className="admin-text-link" href="/admin/leads">View leads</Link>
        </div>
        <div className="admin-grid admin-grid-4">
          {leadStats.map(([label, value]) => (
            <div className="admin-stat-card" key={label}>
              <span>{label}</span><strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section" aria-labelledby="operations-title">
        <div className="admin-section-heading"><h2 id="operations-title">Partner operations</h2></div>
        <div className="admin-grid admin-grid-4">
          {operations.map(([label, value]) => (
            <div className="admin-stat-card" key={label}>
              <span>{label}</span><strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className="admin-help">
          Commission cards show record counts only. Monetary values are displayed per currency on conversion records and are never added across currencies.
        </p>
      </section>

      <section className="admin-section admin-grid admin-grid-3" aria-label="Recent activity">
        <article className="admin-card">
          <div className="admin-section-heading"><h2>Recent leads</h2></div>
          {data.recentLeads.length ? (
            <div className="admin-timeline">
              {data.recentLeads.map((lead) => (
                <div className="admin-timeline-item" key={lead.id}>
                  <Link className="admin-text-link" href={`/admin/leads/${lead.id}`}>{lead.full_name}</Link>
                  <p>{formatAdminLabel(lead.insurance_type)} · <StatusBadge value={lead.status} /></p>
                  <div className="admin-timeline-meta">{formatAdminDate(lead.created_at)}</div>
                </div>
              ))}
            </div>
          ) : <EmptyState>No recent leads.</EmptyState>}
        </article>

        <article className="admin-card">
          <div className="admin-section-heading"><h2>Recent handoffs</h2></div>
          {data.recentHandoffs.length ? (
            <div className="admin-timeline">
              {data.recentHandoffs.map((handoff) => (
                <div className="admin-timeline-item" key={handoff.id}>
                  <Link className="admin-text-link" href={`/admin/leads/${handoff.lead_id}`}>
                    {handoff.partner?.name ?? "Partner handoff"}
                  </Link>
                  <p>{formatAdminLabel(handoff.lead?.insurance_type)} · <StatusBadge value={handoff.status} /></p>
                  <div className="admin-timeline-meta">{formatAdminDate(handoff.created_at)}</div>
                </div>
              ))}
            </div>
          ) : <EmptyState>No recent handoffs.</EmptyState>}
        </article>

        <article className="admin-card">
          <div className="admin-section-heading"><h2>Recent conversions</h2></div>
          {data.recentConversions.length ? (
            <div className="admin-timeline">
              {data.recentConversions.map((conversion) => {
                const handoff = embeddedOne(conversion.handoff);
                return (
                  <div className="admin-timeline-item" key={conversion.id}>
                    <Link className="admin-text-link" href={`/admin/conversions/${conversion.id}`}>
                      {handoff?.partner?.name ?? "Conversion"}
                    </Link>
                    <p><StatusBadge value={conversion.status} /> · {formatCommission(conversion.commission_amount, conversion.commission_currency)}</p>
                    <div className="admin-timeline-meta">{formatAdminDate(conversion.created_at)}</div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState>No recent conversions.</EmptyState>}
        </article>
      </section>
    </>
  );
}
