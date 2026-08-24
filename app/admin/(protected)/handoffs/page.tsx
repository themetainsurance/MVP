import type { Metadata } from "next";
import Link from "next/link";
import AdminMutationForm from "../../components/AdminMutationForm";
import {
  AdminPageHeader,
  AdminPagination,
  EmptyState,
  embeddedOne,
  formatAdminDate,
  formatAdminLabel,
  StatusBadge,
} from "../../components/AdminUi";
import { requireAdmin } from "../../../lib/admin-auth";
import { loadAdminHandoffs } from "../../../lib/admin-dashboard-data";
import {
  isAdminUuid,
  isKnownHandoffStatus,
  normalizeAdminPage,
} from "../../../lib/admin-dashboard-validation";
import { PARTNER_HANDOFF_STATUSES } from "../../../lib/partner-handoff-types";
import {
  PARTNER_INSURANCE_TYPES,
  type PartnerInsuranceType,
} from "../../../lib/partner-types";

export const metadata: Metadata = {
  title: "Partner handoffs",
  description: "Protected partner handoff operations.",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminHandoffsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = await searchParams;
  const page = normalizeAdminPage(first(query.page));
  const rawStatus = first(query.status);
  const status = isKnownHandoffStatus(rawStatus) ? rawStatus : null;
  const rawPartner = first(query.partner);
  const partnerId = isAdminUuid(rawPartner) ? rawPartner : null;
  const rawInsurance = first(query.insurance);
  const insuranceType = PARTNER_INSURANCE_TYPES.includes(rawInsurance as PartnerInsuranceType)
    ? (rawInsurance as PartnerInsuranceType)
    : null;
  const { result, partners } = await loadAdminHandoffs({ page, status, partnerId, insuranceType });

  return (
    <>
      <AdminPageHeader eyebrow="PARTNER OPERATIONS" title="Handoffs" description="Track controlled request assignments and record partner handoff lifecycle changes. Marking a handoff sent records operational state only; it does not send email or call a partner API." />

      <form className="admin-filter-grid" method="get">
        <label>Status<select name="status" defaultValue={status ?? "all"}><option value="all">All statuses</option>{PARTNER_HANDOFF_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
        <label>Partner<select name="partner" defaultValue={partnerId ?? "all"}><option value="all">All partners</option>{partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}</select></label>
        <label>Insurance type<select name="insurance" defaultValue={insuranceType ?? "all"}><option value="all">All insurance types</option>{PARTNER_INSURANCE_TYPES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
        <button className="admin-button admin-button-primary" type="submit">Apply filters</button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Created</th><th>Lead</th><th>Insurance</th><th>Partner</th><th>Method</th><th>Status</th><th>Assigned</th><th>Sent</th><th>Responded</th><th>Actions</th></tr></thead>
          <tbody>{result.items.map((handoff) => {
            const conversion = embeddedOne(handoff.conversion);
            return (
              <tr key={handoff.id}>
                <td>{formatAdminDate(handoff.created_at)}</td>
                <td><Link className="admin-text-link" href={`/admin/leads/${handoff.lead_id}`}>{handoff.lead?.full_name ?? "View lead"}</Link></td>
                <td>{formatAdminLabel(handoff.lead?.insurance_type)}</td>
                <td>{handoff.partner?.name ?? "Partner"}</td>
                <td>{formatAdminLabel(handoff.handoff_method)}</td>
                <td><StatusBadge value={handoff.status} /></td>
                <td>{formatAdminDate(handoff.assigned_at)}</td><td>{formatAdminDate(handoff.sent_at)}</td><td>{formatAdminDate(handoff.responded_at)}</td>
                <td>
                  <div className="admin-actions-stack">
                    {handoff.status === "pending" ? <>
                      <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/handoffs/${handoff.id}/send`} submitLabel="Mark sent"><input type="hidden" name="external_reference" value="" /><input type="hidden" name="internal_note" value="" /></AdminMutationForm>
                      <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/handoffs/${handoff.id}/cancel`} submitLabel="Cancel" confirmMessage="Cancel this pending handoff?"><input type="hidden" name="internal_note" value="Cancelled by administrator" /></AdminMutationForm>
                      <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/handoffs/${handoff.id}/fail`} submitLabel="Mark failed"><input type="hidden" name="failure_code" value="" /><input type="hidden" name="internal_note" value="" /></AdminMutationForm>
                    </> : null}
                    {handoff.status === "sent" ? <>
                      <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/handoffs/${handoff.id}/response`} submitLabel="Accept"><input type="hidden" name="status" value="accepted" /><input type="hidden" name="external_reference" value="" /><input type="hidden" name="internal_note" value="" /></AdminMutationForm>
                      <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/handoffs/${handoff.id}/response`} submitLabel="Reject" confirmMessage="Record this handoff as rejected?"><input type="hidden" name="status" value="rejected" /><input type="hidden" name="external_reference" value="" /><input type="hidden" name="internal_note" value="" /></AdminMutationForm>
                      <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/handoffs/${handoff.id}/fail`} submitLabel="Mark failed"><input type="hidden" name="failure_code" value="" /><input type="hidden" name="internal_note" value="" /></AdminMutationForm>
                    </> : null}
                    {["sent", "accepted"].includes(handoff.status) && !conversion ? (
                      <AdminMutationForm className="admin-inline-form" endpoint="/api/admin/conversions" submitLabel="Create conversion" redirectResultField="conversionId" redirectBase="/admin/conversions/"><input type="hidden" name="handoff_id" value={handoff.id} /><input type="hidden" name="attribution_reference" value="" /><input type="hidden" name="external_conversion_reference" value="" /><input type="hidden" name="internal_note" value="" /></AdminMutationForm>
                    ) : null}
                    {conversion ? <Link className="admin-text-link" href={`/admin/conversions/${conversion.id}`}>View conversion</Link> : null}
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
        {!result.items.length ? <EmptyState>No handoffs found.</EmptyState> : null}
      </div>
      <AdminPagination page={result.page} totalPages={result.totalPages} total={result.total} pathname="/admin/handoffs" query={{ status, partner: partnerId, insurance: insuranceType }} />
    </>
  );
}
