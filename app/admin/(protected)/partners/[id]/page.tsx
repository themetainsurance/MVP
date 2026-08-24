import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminMutationForm from "../../../components/AdminMutationForm";
import {
  AdminPageHeader,
  EmptyState,
  formatAdminDate,
  formatAdminLabel,
  StatusBadge,
} from "../../../components/AdminUi";
import { requireAdmin } from "../../../../lib/admin-auth";
import { loadAdminPartnerDetail } from "../../../../lib/admin-dashboard-data";
import { isAdminUuid } from "../../../../lib/admin-dashboard-validation";
import {
  PARTNER_HANDOFF_METHODS,
  PARTNER_INSURANCE_TYPES,
  PARTNER_STATUSES,
  PARTNER_TYPES,
} from "../../../../lib/partner-types";

export const metadata: Metadata = {
  title: "Partner detail",
  description: "Protected partner record and capabilities.",
};

export default async function AdminPartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isAdminUuid(id)) notFound();
  const data = await loadAdminPartnerDetail(id);
  if (!data) notFound();
  const { partner, capabilities, recentHandoffs, stats } = data;

  return (
    <>
      <AdminPageHeader
        eyebrow="PARTNER DETAIL"
        title={partner.name}
        description={`${formatAdminLabel(partner.partner_type)} · Created ${formatAdminDate(partner.created_at)}`}
        actions={<Link className="admin-button admin-button-secondary" href="/admin/partners">Back to partners</Link>}
      />

      <section className="admin-grid admin-grid-4" aria-label="Partner handoff statistics">
        {[ ["Total handoffs", stats.total], ["Pending", stats.pending], ["Sent", stats.sent], ["Accepted", stats.accepted] ].map(([label, value]) => (
          <div className="admin-stat-card" key={String(label)}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>

      <div className="admin-section admin-split">
        <section className="admin-card">
          <h2>Edit partner</h2>
          <p className="admin-warning">Do not store API keys, passwords, tokens, or credentials here. Deactivate partners instead of deleting them.</p>
          <AdminMutationForm endpoint={`/api/admin/partners/${partner.id}`} method="PATCH" submitLabel="Save partner" successMessage="Partner updated.">
            <label>Name<input name="name" required maxLength={200} defaultValue={partner.name} /></label>
            <label>Partner type<select name="partner_type" required defaultValue={partner.partner_type}>{PARTNER_TYPES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
            <label>Status<select name="status" required defaultValue={partner.status}>{PARTNER_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
            <label>Website URL<input name="website_url" type="url" maxLength={2048} defaultValue={partner.website_url ?? ""} /></label>
            <label>Contact email<input name="contact_email" type="email" maxLength={254} defaultValue={partner.contact_email ?? ""} /></label>
            <label>Handoff method<select name="handoff_method" required defaultValue={partner.handoff_method}>{PARTNER_HANDOFF_METHODS.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
            <label>Affiliate reference<input name="affiliate_reference" maxLength={250} defaultValue={partner.affiliate_reference ?? ""} /></label>
            <label>Internal notes<textarea name="notes" maxLength={2000} defaultValue={partner.notes ?? ""} /></label>
          </AdminMutationForm>
        </section>

        <aside className="admin-card">
          <h2>Add capability</h2>
          <AdminMutationForm endpoint={`/api/admin/partners/${partner.id}/capabilities`} submitLabel="Add capability" successMessage="Capability added.">
            <label>Insurance type<select name="insurance_type" required defaultValue="travel">{PARTNER_INSURANCE_TYPES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
            <label>Country code<input name="country_code" required minLength={2} maxLength={3} pattern="[A-Z]{2,3}" placeholder="MK" /></label>
            <label>Status<select name="status" required defaultValue="active">{PARTNER_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
          </AdminMutationForm>
        </aside>
      </div>

      <section className="admin-section" aria-labelledby="capabilities-title">
        <div className="admin-section-heading"><h2 id="capabilities-title">Capabilities</h2></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Insurance</th><th>Country</th><th>Status</th><th>Created</th><th>Change status</th></tr></thead>
            <tbody>{capabilities.map((capability) => (
              <tr key={capability.id}>
                <td>{formatAdminLabel(capability.insurance_type)}</td>
                <td>{capability.country_code}</td>
                <td><StatusBadge value={capability.status} /></td>
                <td>{formatAdminDate(capability.created_at)}</td>
                <td>
                  <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/partners/${partner.id}/capabilities/${capability.id}`} method="PATCH" submitLabel="Update">
                    <label>Status<select name="status" defaultValue={capability.status}>{PARTNER_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
                  </AdminMutationForm>
                </td>
              </tr>
            ))}</tbody>
          </table>
          {!capabilities.length ? <EmptyState>No capabilities yet.</EmptyState> : null}
        </div>
      </section>

      <section className="admin-section" aria-labelledby="partner-handoffs-title">
        <div className="admin-section-heading"><h2 id="partner-handoffs-title">Recent handoffs</h2><Link className="admin-text-link" href={`/admin/handoffs?partner=${partner.id}`}>View filtered list</Link></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Created</th><th>Lead</th><th>Insurance</th><th>Method</th><th>Status</th><th>Open</th></tr></thead>
            <tbody>{recentHandoffs.map((handoff) => (
              <tr key={handoff.id}>
                <td>{formatAdminDate(handoff.created_at)}</td><td>{handoff.lead?.full_name ?? "Lead"}</td>
                <td>{formatAdminLabel(handoff.lead?.insurance_type)}</td><td>{formatAdminLabel(handoff.handoff_method)}</td>
                <td><StatusBadge value={handoff.status} /></td><td><Link className="admin-text-link" href={`/admin/leads/${handoff.lead_id}`}>View lead</Link></td>
              </tr>
            ))}</tbody>
          </table>
          {!recentHandoffs.length ? <EmptyState>No handoffs found.</EmptyState> : null}
        </div>
      </section>
    </>
  );
}
