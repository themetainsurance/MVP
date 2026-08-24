import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PolicyComparisonView from "../../../../../components/PolicyComparisonView";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { loadAdminComparisonDetail } from "../../../../../lib/comparison-admin-data";
import { buildCustomerComparisonSnapshot } from "../../../../../lib/comparison-share-snapshot";
import { isComparisonUuid } from "../../../../../lib/comparison-validation";

export const metadata: Metadata = { title: "Comparison preview", robots: { index: false, follow: false } };

export default async function ComparisonPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); const { id } = await params; if (!isComparisonUuid(id)) notFound();
  const loaded = await loadAdminComparisonDetail(id); if (!loaded.available || !loaded.detail) notFound();
  let snapshot;
  try { snapshot = buildCustomerComparisonSnapshot(loaded.detail.comparison, loaded.detail.options, new Date().toISOString()); }
  catch { return <main className="admin-card"><h1>Preview unavailable</h1><p>Add one current policy and one to five active partner offers before previewing.</p><Link href={`/admin/comparisons/${id}`}>Return to editor</Link></main>; }
  return <div className="admin-blog-preview"><div className="admin-preview-banner">ADMIN PREVIEW · This is not a public share link</div><PolicyComparisonView snapshot={snapshot} /></div>;
}
