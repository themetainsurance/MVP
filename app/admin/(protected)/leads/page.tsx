import type { Metadata } from "next";
import AdminLeadsTable from "../../components/AdminLeadsTable";
import { AdminPageHeader } from "../../components/AdminUi";
import { requireAdmin } from "../../../lib/admin-auth";
import { loadAdminLeads } from "../../../lib/admin-dashboard-data";

export const metadata: Metadata = {
  title: "Leads",
  description: "Protected insurance request operations.",
};

export default async function AdminLeadsPage() {
  await requireAdmin();
  const initialResult = await loadAdminLeads({
    insuranceType: null,
    status: null,
    search: null,
    page: 1,
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="INSURANCE REQUESTS"
        title="Leads"
        description="Review protected customer request records, filter operational status and open a lead for controlled lifecycle actions."
      />
      <AdminLeadsTable initialResult={initialResult} />
    </>
  );
}
