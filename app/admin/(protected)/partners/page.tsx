import type { Metadata } from "next";
import Link from "next/link";
import AdminMutationForm from "../../components/AdminMutationForm";
import {
  AdminPageHeader,
  AdminPagination,
  EmptyState,
  formatAdminDate,
  formatAdminLabel,
  safeAdminWebsiteUrl,
  StatusBadge,
} from "../../components/AdminUi";
import { requireAdmin } from "../../../lib/admin-auth";
import { loadAdminPartners } from "../../../lib/admin-dashboard-data";
import { normalizeAdminPage } from "../../../lib/admin-dashboard-validation";
import {
  PARTNER_HANDOFF_METHODS,
  PARTNER_STATUSES,
  PARTNER_TYPES,
  type PartnerStatus,
} from "../../../lib/partner-types";

export const metadata: Metadata = {
  title: "Partners",
  description: "Protected partner and capability operations.",
};

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const page = normalizeAdminPage(Array.isArray(query.page) ? query.page[0] : query.page);
  const rawStatus = Array.isArray(query.status) ? query.status[0] : query.status;
  const status = rawStatus && PARTNER_STATUSES.includes(rawStatus as PartnerStatus)
    ? (rawStatus as PartnerStatus)
    : null;
  const result = await loadAdminPartners(page, status);

  return (
    <>
      <AdminPageHeader
        eyebrow="PARTNER DIRECTORY"
        title="Partners"
        description="Create and maintain operational partner records and route requests through active capabilities. Partners are deactivated rather than deleted."
      />

      <div className="admin-split">
        <section>
          <form className="admin-filter-grid" method="get">
            <label>Status
              <select name="status" defaultValue={status ?? "all"}>
                <option value="all">All statuses</option>
                {PARTNER_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}
              </select>
            </label>
            <button className="admin-button admin-button-primary" type="submit">Apply filter</button>
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Partner</th><th>Type</th><th>Status</th><th>Method</th><th>Website</th><th>Contact</th><th>Capabilities</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>{result.items.map((partner) => {
                const websiteUrl = safeAdminWebsiteUrl(partner.website_url);
                return <tr key={partner.id}>
                  <td>{partner.name}</td>
                  <td>{formatAdminLabel(partner.partner_type)}</td>
                  <td><StatusBadge value={partner.status} /></td>
                  <td>{formatAdminLabel(partner.handoff_method)}</td>
                  <td>{websiteUrl ? <a className="admin-text-link" href={websiteUrl} target="_blank" rel="noopener noreferrer">Open site</a> : "Not provided"}</td>
                  <td>{partner.contact_email ?? "Not provided"}</td>
                  <td>{partner.capabilities?.length ?? 0}</td>
                  <td>{formatAdminDate(partner.created_at)}</td>
                  <td><Link className="admin-text-link" href={`/admin/partners/${partner.id}`}>View / Edit</Link></td>
                </tr>;
              })}</tbody>
            </table>
            {!result.items.length ? <EmptyState>No partners found.</EmptyState> : null}
          </div>
          <AdminPagination page={result.page} totalPages={result.totalPages} total={result.total} pathname="/admin/partners" query={{ status }} />
        </section>

        <aside className="admin-card">
          <h2>Create partner</h2>
          <p className="admin-warning">Do not store API keys, passwords, tokens, or credentials here.</p>
          <AdminMutationForm endpoint="/api/admin/partners" submitLabel="Create partner" successMessage="Partner created." redirectResultField="partnerId" redirectBase="/admin/partners/">
            <label>Name<input name="name" required maxLength={200} /></label>
            <label>Partner type<select name="partner_type" required defaultValue="broker">{PARTNER_TYPES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
            <label>Status<select name="status" required defaultValue="active">{PARTNER_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
            <label>Website URL<input name="website_url" type="url" maxLength={2048} placeholder="https://" /></label>
            <label>Contact email<input name="contact_email" type="email" maxLength={254} /></label>
            <label>Handoff method<select name="handoff_method" required defaultValue="manual">{PARTNER_HANDOFF_METHODS.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
            <label>Affiliate reference<input name="affiliate_reference" maxLength={250} /></label>
            <label>Internal notes<textarea name="notes" maxLength={2000} /></label>
          </AdminMutationForm>
        </aside>
      </div>
    </>
  );
}
