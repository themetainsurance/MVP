import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ComparisonWorkspace from "../../../components/ComparisonWorkspace";
import { AdminPageHeader, EmptyState, StatusBadge, formatAdminDate, formatAdminLabel } from "../../../components/AdminUi";
import { requireAdmin } from "../../../../lib/admin-auth";
import { loadAdminComparisonDetail } from "../../../../lib/comparison-admin-data";
import { isComparisonUuid } from "../../../../lib/comparison-validation";

export const metadata: Metadata = { title: "Policy comparison detail", description: "Protected factual comparison editor." };
function one<T>(value: T | T[] | null) { return Array.isArray(value) ? value[0] ?? null : value; }

export default async function ComparisonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); const { id } = await params; if (!isComparisonUuid(id)) notFound();
  const loaded = await loadAdminComparisonDetail(id);
  if (!loaded.available) return <><AdminPageHeader eyebrow="FACTUAL COMPARISON" title="Comparison unavailable" description="The comparison database setup is not available yet." /><div className="admin-card"><EmptyState>Apply the separately reviewed migration before using this workflow.</EmptyState></div></>;
  if (!loaded.detail) notFound();
  const { comparison, options, shares, partners, handoffs } = loaded.detail;
  const lead = one(comparison.lead);
  return <>
    <AdminPageHeader eyebrow="FACTUAL COMPARISON" title={comparison.title} description={`${formatAdminLabel(comparison.insurance_type)} · version ${comparison.version}`} actions={<><Link className="admin-button admin-button-secondary" href="/admin/comparisons">Back</Link><Link className="admin-button admin-button-secondary" href={`/admin/comparisons/${comparison.id}/preview`}>Factual preview</Link></>} />
    <section className="admin-card admin-section"><div className="admin-section-heading"><h2>Record information</h2><StatusBadge value={comparison.status} /></div><dl className="admin-detail-list"><div><dt>Comparison ID</dt><dd className="admin-code">{comparison.id}</dd></div><div><dt>Lead reference</dt><dd><Link className="admin-text-link admin-code" href={`/admin/leads/${comparison.lead_id}`}>{comparison.lead_id}</Link></dd></div><div><dt>Created</dt><dd>{formatAdminDate(comparison.created_at)}</dd></div><div><dt>Updated</dt><dd>{formatAdminDate(comparison.updated_at)}</dd></div><div><dt>Ready</dt><dd>{formatAdminDate(comparison.ready_at)}</dd></div><div><dt>Archived</dt><dd>{formatAdminDate(comparison.archived_at)}</dd></div></dl>{lead?.policy_document_path ? <p><a className="admin-button admin-button-secondary" href={`/api/admin/leads/${comparison.lead_id}/policy-document`} target="_blank" rel="noopener noreferrer">Securely view current policy document</a></p> : null}</section>
    <div className="admin-section"><ComparisonWorkspace comparison={comparison} options={options} shares={shares} partners={partners} handoffs={handoffs} /></div>
  </>;
}
