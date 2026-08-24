import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminMutationForm from "../../../components/AdminMutationForm";
import {
  AdminPageHeader,
  EmptyState,
  embeddedOne,
  formatAdminDate,
  formatAdminLabel,
  formatCommission,
  StatusBadge,
} from "../../../components/AdminUi";
import { requireAdmin } from "../../../../lib/admin-auth";
import { loadAdminConversionDetail } from "../../../../lib/admin-dashboard-data";
import { isAdminUuid } from "../../../../lib/admin-dashboard-validation";
import type { AffiliateCommissionStatus } from "../../../../lib/affiliate-conversion-types";

export const metadata: Metadata = {
  title: "Conversion detail",
  description: "Protected conversion, commission and audit history.",
};

export default async function AdminConversionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isAdminUuid(id)) notFound();
  const data = await loadAdminConversionDetail(id);
  if (!data) notFound();
  const { conversion, history } = data;
  const handoff = embeddedOne(conversion.handoff);

  return (
    <>
      <AdminPageHeader
        eyebrow="CONVERSION DETAIL"
        title="Affiliate conversion"
        description={`Reported ${formatAdminDate(conversion.reported_at)} for ${handoff?.partner?.name ?? "a partner"}.`}
        actions={<Link className="admin-button admin-button-secondary" href="/admin/conversions">Back to conversions</Link>}
      />

      <div className="admin-split">
        <div className="admin-grid">
          <section className="admin-card">
            <h2>Conversion record</h2>
            <dl className="admin-detail-list">
              <div><dt>Conversion ID</dt><dd className="admin-code">{conversion.id}</dd></div>
              <div><dt>Conversion status</dt><dd><StatusBadge value={conversion.status} /></dd></div>
              <div><dt>Lead</dt><dd>{handoff ? <Link className="admin-text-link" href={`/admin/leads/${handoff.lead_id}`}>{handoff.lead?.full_name ?? "View lead"}</Link> : "Unavailable"}</dd></div>
              <div><dt>Partner</dt><dd>{handoff?.partner?.name ?? "Unavailable"}</dd></div>
              <div><dt>Insurance type</dt><dd>{formatAdminLabel(handoff?.lead?.insurance_type)}</dd></div>
              <div><dt>Handoff status</dt><dd>{handoff ? <StatusBadge value={handoff.status} /> : "Unavailable"}</dd></div>
              <div><dt>Attribution reference</dt><dd>{conversion.attribution_reference ?? "Not recorded"}</dd></div>
              <div><dt>External conversion reference</dt><dd>{conversion.external_conversion_reference ?? "Not recorded"}</dd></div>
              <div><dt>Confirmed</dt><dd>{formatAdminDate(conversion.confirmed_at)}</dd></div>
              <div><dt>Reversed</dt><dd>{formatAdminDate(conversion.reversed_at)}</dd></div>
            </dl>
          </section>

          <section className="admin-card">
            <h2>Commission record</h2>
            <dl className="admin-detail-list">
              <div><dt>Status</dt><dd><StatusBadge value={conversion.commission_status} /></dd></div>
              <div><dt>Amount</dt><dd>{formatCommission(conversion.commission_amount, conversion.commission_currency)}</dd></div>
              <div><dt>Reported</dt><dd>{formatAdminDate(conversion.commission_reported_at)}</dd></div>
              <div><dt>Paid</dt><dd>{formatAdminDate(conversion.commission_paid_at)}</dd></div>
            </dl>
          </section>
        </div>

        <aside className="admin-grid">
          <section className="admin-card">
            <h2>Conversion actions</h2>
            {conversion.status === "pending" ? <div className="admin-actions-stack">
              <ConversionAction id={conversion.id} status="confirmed" label="Confirm conversion" />
              <ConversionAction id={conversion.id} status="rejected" label="Reject conversion" confirm="Reject this conversion?" />
            </div> : null}
            {conversion.status === "confirmed" ? <ConversionAction id={conversion.id} status="reversed" label="Reverse conversion" confirm="Reverse this confirmed conversion? This is a terminal operational action." /> : null}
            {["rejected", "reversed"].includes(conversion.status) ? <p className="admin-help">No further conversion status actions are valid.</p> : null}
          </section>

          <section className="admin-card">
            <h2>Commission actions</h2>
            <CommissionActions
              conversionId={conversion.id}
              current={conversion.commission_status}
              amount={conversion.commission_amount}
              currency={conversion.commission_currency}
            />
          </section>
        </aside>
      </div>

      <section className="admin-section admin-card" aria-labelledby="conversion-history-title">
        <h2 id="conversion-history-title">Conversion and commission history</h2>
        {history.length ? <div className="admin-timeline">
          {history.map((entry) => <div className="admin-timeline-item" key={entry.id}>
            <strong>Conversion: {formatAdminLabel(entry.previous_conversion_status)} → {formatAdminLabel(entry.new_conversion_status)}</strong>
            <p>Commission: {formatAdminLabel(entry.previous_commission_status)} → {formatAdminLabel(entry.new_commission_status)}</p>
            <p>Source: {formatAdminLabel(entry.change_source)}</p>
            {entry.note ? <p>{entry.note}</p> : null}
            <div className="admin-timeline-meta">{formatAdminDate(entry.created_at)}</div>
          </div>)}
        </div> : <EmptyState>No conversion history found.</EmptyState>}
      </section>
    </>
  );
}

function ConversionAction({ id, status, label, confirm }: { id: string; status: "confirmed" | "rejected" | "reversed"; label: string; confirm?: string }) {
  return <AdminMutationForm endpoint={`/api/admin/conversions/${id}/status`} method="PATCH" submitLabel={label} confirmMessage={confirm}>
    <input type="hidden" name="status" value={status} />
    <label>External conversion reference<input name="external_conversion_reference" maxLength={250} /></label>
    <label>Internal note<textarea name="internal_note" maxLength={1000} /></label>
  </AdminMutationForm>;
}

function CommissionActions({ conversionId, current, amount, currency }: { conversionId: string; current: AffiliateCommissionStatus; amount: string | number | null; currency: string | null }) {
  const storedAmount = amount === null ? "" : String(amount);
  const storedCurrency = currency ?? "";
  const actions: Array<{ status: "pending" | "approved" | "paid" | "rejected" | "reversed"; label: string; valuesRequired?: boolean; confirm?: string }> = [];
  if (current === "not_reported") actions.push(
    { status: "pending", label: "Mark pending" },
    { status: "approved", label: "Approve commission", valuesRequired: true },
    { status: "rejected", label: "Reject commission", confirm: "Reject this commission?" }
  );
  if (current === "pending") actions.push(
    { status: "approved", label: "Approve commission", valuesRequired: true },
    { status: "rejected", label: "Reject commission", confirm: "Reject this commission?" }
  );
  if (current === "approved") actions.push(
    { status: "paid", label: "Mark paid", valuesRequired: true, confirm: "Mark this commission as paid?" },
    { status: "reversed", label: "Reverse commission", confirm: "Reverse this approved commission?" }
  );
  if (current === "paid") actions.push({ status: "reversed", label: "Reverse commission", confirm: "Reverse this paid commission?" });
  if (!actions.length) return <p className="admin-help">No further commission actions are valid.</p>;

  return <div className="admin-actions-stack">{actions.map((action) => (
    <details key={action.status}><summary>{action.label}</summary>
      <AdminMutationForm className="admin-form admin-section" endpoint={`/api/admin/conversions/${conversionId}/commission`} method="PATCH" submitLabel={action.label} confirmMessage={action.confirm}>
        <input type="hidden" name="status" value={action.status} />
        <label>Amount
          <input name="amount" inputMode="decimal" pattern="(?:0|[1-9][0-9]{0,9})(?:\.[0-9]{1,2})?" maxLength={13} required={action.valuesRequired} defaultValue={storedAmount} placeholder="1250.75" />
        </label>
        <label>Currency
          <input name="currency" pattern="[A-Z]{3}" minLength={3} maxLength={3} required={action.valuesRequired} defaultValue={storedCurrency} placeholder="EUR" />
        </label>
        <label>Internal note<textarea name="internal_note" maxLength={1000} /></label>
      </AdminMutationForm>
    </details>
  ))}</div>;
}
