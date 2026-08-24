import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageHeader,
  AdminPagination,
  EmptyState,
  embeddedOne,
  formatAdminDate,
  formatAdminLabel,
  formatCommission,
  StatusBadge,
} from "../../components/AdminUi";
import { requireAdmin } from "../../../lib/admin-auth";
import { loadAdminConversions } from "../../../lib/admin-dashboard-data";
import {
  isAdminUuid,
  normalizeAdminPage,
} from "../../../lib/admin-dashboard-validation";
import {
  AFFILIATE_COMMISSION_STATUSES,
  AFFILIATE_CONVERSION_STATUSES,
  type AffiliateCommissionStatus,
  type AffiliateConversionStatus,
} from "../../../lib/affiliate-conversion-types";
import {
  PARTNER_INSURANCE_TYPES,
  type PartnerInsuranceType,
} from "../../../lib/partner-types";

export const metadata: Metadata = {
  title: "Affiliate conversions",
  description: "Protected conversion and commission operations.",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminConversionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = await searchParams;
  const page = normalizeAdminPage(first(query.page));
  const rawStatus = first(query.status);
  const status = AFFILIATE_CONVERSION_STATUSES.includes(rawStatus as AffiliateConversionStatus) ? rawStatus as AffiliateConversionStatus : null;
  const rawCommission = first(query.commission);
  const commissionStatus = AFFILIATE_COMMISSION_STATUSES.includes(rawCommission as AffiliateCommissionStatus) ? rawCommission as AffiliateCommissionStatus : null;
  const rawPartner = first(query.partner);
  const partnerId = isAdminUuid(rawPartner) ? rawPartner : null;
  const rawInsurance = first(query.insurance);
  const insuranceType = PARTNER_INSURANCE_TYPES.includes(rawInsurance as PartnerInsuranceType) ? rawInsurance as PartnerInsuranceType : null;
  const { result, partners } = await loadAdminConversions({ page, status, commissionStatus, partnerId, insuranceType });

  return (
    <>
      <AdminPageHeader eyebrow="AFFILIATE OPERATIONS" title="Conversions" description="Track partner-attributed conversions and actual reported commission lifecycle values. Currency amounts are never converted or combined across currencies." />
      <form className="admin-filter-grid" method="get">
        <label>Conversion status<select name="status" defaultValue={status ?? "all"}><option value="all">All conversion statuses</option>{AFFILIATE_CONVERSION_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
        <label>Commission status<select name="commission" defaultValue={commissionStatus ?? "all"}><option value="all">All commission statuses</option>{AFFILIATE_COMMISSION_STATUSES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
        <label>Partner<select name="partner" defaultValue={partnerId ?? "all"}><option value="all">All partners</option>{partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}</select></label>
        <label>Insurance type<select name="insurance" defaultValue={insuranceType ?? "all"}><option value="all">All insurance types</option>{PARTNER_INSURANCE_TYPES.map((value) => <option key={value} value={value}>{formatAdminLabel(value)}</option>)}</select></label>
        <button className="admin-button admin-button-primary" type="submit">Apply filters</button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Created</th><th>Lead</th><th>Partner</th><th>Insurance</th><th>Conversion</th><th>Commission</th><th>Amount</th><th>Reported</th><th>Confirmed</th><th>Paid</th><th>Actions</th></tr></thead>
          <tbody>{result.items.map((conversion) => {
            const handoff = embeddedOne(conversion.handoff);
            return <tr key={conversion.id}>
              <td>{formatAdminDate(conversion.created_at)}</td>
              <td>{handoff ? <Link className="admin-text-link" href={`/admin/leads/${handoff.lead_id}`}>{handoff.lead?.full_name ?? "View lead"}</Link> : "Lead unavailable"}</td>
              <td>{handoff?.partner?.name ?? "Partner unavailable"}</td>
              <td>{formatAdminLabel(handoff?.lead?.insurance_type)}</td>
              <td><StatusBadge value={conversion.status} /></td>
              <td><StatusBadge value={conversion.commission_status} /></td>
              <td>{formatCommission(conversion.commission_amount, conversion.commission_currency)}</td>
              <td>{formatAdminDate(conversion.reported_at)}</td><td>{formatAdminDate(conversion.confirmed_at)}</td><td>{formatAdminDate(conversion.commission_paid_at)}</td>
              <td><Link className="admin-text-link" href={`/admin/conversions/${conversion.id}`}>Manage</Link></td>
            </tr>;
          })}</tbody>
        </table>
        {!result.items.length ? <EmptyState>No conversions found.</EmptyState> : null}
      </div>
      <AdminPagination page={result.page} totalPages={result.totalPages} total={result.total} pathname="/admin/conversions" query={{ status, commission: commissionStatus, partner: partnerId, insurance: insuranceType }} />
    </>
  );
}
