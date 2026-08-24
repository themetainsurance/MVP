import type { Metadata } from "next";
import Link from "next/link";
import ComparisonCreateForm from "../../../components/ComparisonCreateForm";
import { AdminPageHeader, EmptyState } from "../../../components/AdminUi";
import { requireAdmin } from "../../../../lib/admin-auth";
import { loadAdminComparisonLeadChoices } from "../../../../lib/comparison-admin-data";
import { isComparisonUuid } from "../../../../lib/comparison-validation";

export const metadata: Metadata = { title: "New policy comparison", description: "Create a protected factual policy comparison draft." };

export default async function NewComparisonPage({ searchParams }: { searchParams: Promise<{ lead?: string | string[] }> }) {
  await requireAdmin();
  const query = await searchParams;
  const requestedLead = Array.isArray(query.lead) ? query.lead[0] : query.lead;
  const leads = await loadAdminComparisonLeadChoices();
  const initialLeadId = requestedLead && isComparisonUuid(requestedLead) && leads.some((lead) => lead.id === requestedLead) ? requestedLead : null;
  return <>
    <AdminPageHeader eyebrow="NEW FACTUAL COMPARISON" title="Create comparison draft" description="Select a lead, add a title and then manually enter policy facts. Insurance type is derived from the lead." actions={<Link className="admin-button admin-button-secondary" href="/admin/comparisons">Back to comparisons</Link>} />
    <section className="admin-card admin-blog-new-card">{leads.length ? <ComparisonCreateForm leads={leads} initialLeadId={initialLeadId} /> : <EmptyState>No eligible leads are available.</EmptyState>}</section>
  </>;
}
