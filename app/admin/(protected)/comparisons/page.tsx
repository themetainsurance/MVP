import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminPagination, EmptyState, StatusBadge, formatAdminDate, formatAdminLabel } from "../../components/AdminUi";
import { requireAdmin } from "../../../lib/admin-auth";
import { loadAdminComparisonList } from "../../../lib/comparison-admin-data";
import { validateComparisonListFilters } from "../../../lib/comparison-validation";

export const metadata: Metadata = { title: "Policy comparisons", description: "Protected factual policy comparison administration." };

export default async function AdminComparisonsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const raw = await searchParams;
  const stringValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const validation = validateComparisonListFilters({ status: stringValue(raw.status), insurance_type: stringValue(raw.insurance_type), search: stringValue(raw.search), page: stringValue(raw.page) });
  const filters = validation.success ? validation.data : { status: null, insuranceType: null, search: null, page: 1 };
  const result = await loadAdminComparisonList(filters);
  return <>
    <AdminPageHeader eyebrow="FACTUAL WORKFLOW" title="Policy comparisons" description="Create and share factual side-by-side summaries without scores, rankings or suitability conclusions." actions={<Link className="admin-button admin-button-primary" href="/admin/comparisons/new">New comparison</Link>} />
    <form className="admin-filter-grid" method="get">
      <label>Status<select name="status" defaultValue={filters.status ?? "all"}><option value="all">All</option><option value="draft">Draft</option><option value="ready">Ready</option><option value="archived">Archived</option></select></label>
      <label>Insurance<select name="insurance_type" defaultValue={filters.insuranceType ?? "all"}><option value="all">All</option><option value="travel">Travel</option><option value="motor">Motor</option><option value="property">Property</option></select></label>
      <label>Title search<input name="search" maxLength={100} defaultValue={filters.search ?? ""} /></label>
      <button className="admin-button admin-button-secondary">Filter</button>
    </form>
    {!result.available ? <div className="admin-card"><EmptyState>Comparison database setup is not available yet.</EmptyState></div> : result.items.length ? <>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Created / updated</th><th>Insurance</th><th>Title</th><th>Status</th><th>Lead reference</th><th>Active offers</th><th>Active shares</th><th>Actions</th></tr></thead><tbody>{result.items.map((item) => {
        const record = item as typeof item & { options?: { option_type: string; status: string }[]; shares?: { expires_at: string; revoked_at: string | null }[] };
        const offerCount = (record.options ?? []).filter((option) => option.option_type === "partner_offer" && option.status === "active").length;
        const shareCount = (record.shares ?? []).filter((share) => !share.revoked_at && new Date(share.expires_at) > new Date()).length;
        return <tr key={record.id}><td>{formatAdminDate(record.created_at)}<br /><span className="admin-muted">Updated {formatAdminDate(record.updated_at)}</span></td><td>{formatAdminLabel(record.insurance_type)}</td><td>{record.title}</td><td><StatusBadge value={record.status} /></td><td className="admin-code">{record.lead_id}</td><td>{offerCount}</td><td>{shareCount}</td><td><div className="admin-actions-row"><Link className="admin-text-link" href={`/admin/comparisons/${record.id}`}>Open</Link><Link className="admin-text-link" href={`/admin/comparisons/${record.id}/preview`}>Preview</Link></div></td></tr>;
      })}</tbody></table></div>
      <AdminPagination page={filters.page} totalPages={result.totalPages} total={result.total} pathname="/admin/comparisons" query={{ status: filters.status, insurance_type: filters.insuranceType, search: filters.search }} />
    </> : <div className="admin-card"><EmptyState>No policy comparisons match these filters.</EmptyState></div>}
  </>;
}
