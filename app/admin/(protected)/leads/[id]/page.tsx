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
  JsonDetails,
  StatusBadge,
} from "../../../components/AdminUi";
import { requireAdmin } from "../../../../lib/admin-auth";
import { loadAdminLeadDetail } from "../../../../lib/admin-dashboard-data";
import { isAdminUuid } from "../../../../lib/admin-dashboard-validation";
import { LEAD_STATUSES } from "../../../../lib/lead-status-types";
import { PARTNER_HANDOFF_METHODS } from "../../../../lib/partner-types";

export const metadata: Metadata = {
  title: "Lead detail",
  description: "Protected insurance request detail and operational history.",
};

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!isAdminUuid(id)) notFound();
  const data = await loadAdminLeadDetail(id);
  if (!data) notFound();
  const { lead, history, handoffs, handoffHistory, eligiblePartners } = data;

  return (
    <>
      <AdminPageHeader
        eyebrow="LEAD DETAIL"
        title={lead.full_name}
        description={`${formatAdminLabel(lead.insurance_type)} request created ${formatAdminDate(lead.created_at)}.`}
        actions={<Link className="admin-button admin-button-secondary" href="/admin/leads">Back to leads</Link>}
      />

      <div className="admin-split">
        <div className="admin-grid">
          <section className="admin-card" aria-labelledby="lead-record-title">
            <h2 id="lead-record-title">Request record</h2>
            <dl className="admin-detail-list">
              <div><dt>Lead ID</dt><dd className="admin-code">{lead.id}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge value={lead.status} /></dd></div>
              <div><dt>Created</dt><dd>{formatAdminDate(lead.created_at)}</dd></div>
              <div><dt>Insurance type</dt><dd>{formatAdminLabel(lead.insurance_type)}</dd></div>
              <div><dt>Full name</dt><dd>{lead.full_name}</dd></div>
              <div><dt>Email</dt><dd>{lead.email ?? "Not provided"}</dd></div>
              <div><dt>Phone</dt><dd>{lead.phone ?? "Not provided"}</dd></div>
              <div><dt>Preferred contact</dt><dd>{lead.preferred_contact ?? "Not provided"}</dd></div>
              <div><dt>Consent</dt><dd>{lead.consent ? "Recorded" : "Not recorded"}</dd></div>
              <div><dt>Policy document</dt><dd>{lead.policy_document_path ? "Available" : "Not uploaded"}</dd></div>
            </dl>
            {lead.policy_document_path ? (
              <p>
                <a className="admin-button admin-button-secondary" href={`/api/admin/leads/${lead.id}/policy-document`} target="_blank" rel="noopener noreferrer">
                  Securely download policy document
                </a>
              </p>
            ) : null}
          </section>

          <section className="admin-card" aria-labelledby="lead-details-title">
            <h2 id="lead-details-title">Lead details</h2>
            <JsonDetails value={lead.details} />
          </section>
        </div>

        <aside className="admin-grid">
          <section className="admin-card" aria-labelledby="lead-status-action-title">
            <h2 id="lead-status-action-title">Change lead status</h2>
            <AdminMutationForm endpoint={`/api/admin/leads/${lead.id}/status`} method="PATCH" submitLabel="Update status" successMessage="Lead status updated.">
              <label>Status
                <select name="status" defaultValue={lead.status} required>
                  {LEAD_STATUSES.map((status) => <option key={status} value={status}>{formatAdminLabel(status)}</option>)}
                </select>
              </label>
              <label>Internal note
                <textarea name="note" maxLength={1000} placeholder="Optional operational context" />
              </label>
            </AdminMutationForm>
          </section>

          <section className="admin-card" aria-labelledby="create-handoff-title">
            <h2 id="create-handoff-title">Create partner handoff</h2>
            {eligiblePartners.length ? (
              <AdminMutationForm endpoint={`/api/admin/leads/${lead.id}/handoffs`} submitLabel="Create handoff" successMessage="Pending handoff created.">
                <label>Active capable partner
                  <select name="partner_id" required defaultValue="">
                    <option value="" disabled>Select a partner</option>
                    {eligiblePartners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
                  </select>
                </label>
                <label>Handoff method
                  <select name="handoff_method" defaultValue="">
                    <option value="">Use partner default</option>
                    {PARTNER_HANDOFF_METHODS.map((method) => <option key={method} value={method}>{formatAdminLabel(method)}</option>)}
                  </select>
                </label>
                <label>Internal note
                  <textarea name="internal_note" maxLength={1000} placeholder="Optional operational context" />
                </label>
              </AdminMutationForm>
            ) : <EmptyState>No active partner has a matching active capability.</EmptyState>}
          </section>
        </aside>
      </div>

      <section className="admin-section" aria-labelledby="handoffs-title">
        <div className="admin-section-heading"><h2 id="handoffs-title">Partner handoffs</h2></div>
        {handoffs.length ? (
          <div className="admin-grid">
            {handoffs.map((handoff) => {
              const conversion = embeddedOne(handoff.conversion);
              return (
                <article className="admin-card" key={handoff.id}>
                  <div className="admin-section-heading">
                    <div>
                      <h3>{handoff.partner?.name ?? "Partner"}</h3>
                      <span className="admin-code">{handoff.id}</span>
                    </div>
                    <StatusBadge value={handoff.status} />
                  </div>
                  <dl className="admin-detail-list">
                    <div><dt>Method</dt><dd>{formatAdminLabel(handoff.handoff_method)}</dd></div>
                    <div><dt>Assigned</dt><dd>{formatAdminDate(handoff.assigned_at)}</dd></div>
                    <div><dt>Sent</dt><dd>{formatAdminDate(handoff.sent_at)}</dd></div>
                    <div><dt>Responded</dt><dd>{formatAdminDate(handoff.responded_at)}</dd></div>
                    <div><dt>External reference</dt><dd>{handoff.external_reference ?? "Not recorded"}</dd></div>
                    <div><dt>Failure code</dt><dd>{handoff.failure_code ?? "Not recorded"}</dd></div>
                  </dl>

                  <div className="admin-actions-stack admin-section">
                    {handoff.status === "pending" ? (
                      <>
                        <details><summary>Mark sent</summary>
                          <AdminMutationForm className="admin-form admin-section" endpoint={`/api/admin/handoffs/${handoff.id}/send`} submitLabel="Mark sent">
                            <label>External reference<input name="external_reference" maxLength={250} /></label>
                            <label>Internal note<textarea name="internal_note" maxLength={1000} /></label>
                          </AdminMutationForm>
                        </details>
                        <details><summary>Mark failed</summary>
                          <AdminMutationForm className="admin-form admin-section" endpoint={`/api/admin/handoffs/${handoff.id}/fail`} submitLabel="Mark failed">
                            <label>Failure code<input name="failure_code" maxLength={100} /></label>
                            <label>Internal note<textarea name="internal_note" maxLength={1000} /></label>
                          </AdminMutationForm>
                        </details>
                        <AdminMutationForm className="admin-inline-form" endpoint={`/api/admin/handoffs/${handoff.id}/cancel`} submitLabel="Cancel handoff" confirmMessage="Cancel this pending handoff?">
                          <input type="hidden" name="internal_note" value="Cancelled by administrator" />
                        </AdminMutationForm>
                      </>
                    ) : null}

                    {handoff.status === "sent" ? (
                      <>
                        <details><summary>Record partner response</summary>
                          <AdminMutationForm className="admin-form admin-section" endpoint={`/api/admin/handoffs/${handoff.id}/response`} submitLabel="Record response">
                            <label>Response<select name="status" required defaultValue="accepted"><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select></label>
                            <label>External reference<input name="external_reference" maxLength={250} /></label>
                            <label>Internal note<textarea name="internal_note" maxLength={1000} /></label>
                          </AdminMutationForm>
                        </details>
                        <details><summary>Mark failed</summary>
                          <AdminMutationForm className="admin-form admin-section" endpoint={`/api/admin/handoffs/${handoff.id}/fail`} submitLabel="Mark failed">
                            <label>Failure code<input name="failure_code" maxLength={100} /></label>
                            <label>Internal note<textarea name="internal_note" maxLength={1000} /></label>
                          </AdminMutationForm>
                        </details>
                      </>
                    ) : null}

                    {["sent", "accepted"].includes(handoff.status) && !conversion ? (
                      <details><summary>Create conversion</summary>
                        <AdminMutationForm className="admin-form admin-section" endpoint="/api/admin/conversions" submitLabel="Create conversion" redirectResultField="conversionId" redirectBase="/admin/conversions/">
                          <input type="hidden" name="handoff_id" value={handoff.id} />
                          <label>Attribution reference<input name="attribution_reference" maxLength={250} /></label>
                          <label>External conversion reference<input name="external_conversion_reference" maxLength={250} /></label>
                          <label>Internal note<textarea name="internal_note" maxLength={1000} /></label>
                        </AdminMutationForm>
                      </details>
                    ) : null}
                    {conversion ? <Link className="admin-text-link" href={`/admin/conversions/${conversion.id}`}>View conversion</Link> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="admin-card"><EmptyState>No partner handoffs yet.</EmptyState></div>}
      </section>

      <div className="admin-section admin-grid admin-grid-2">
        <section className="admin-card" aria-labelledby="lead-history-title">
          <h2 id="lead-history-title">Lead status history</h2>
          {history.length ? <div className="admin-timeline">
            {history.map((entry) => <div className="admin-timeline-item" key={entry.id}>
              <strong>{formatAdminLabel(entry.previous_status)} → {formatAdminLabel(entry.new_status)}</strong>
              <p>Source: {formatAdminLabel(entry.change_source)}{entry.actor_reference ? ` · Actor ${entry.actor_reference}` : ""}</p>
              {entry.note ? <p>{entry.note}</p> : null}
              <div className="admin-timeline-meta">{formatAdminDate(entry.created_at)}</div>
            </div>)}
          </div> : <EmptyState>No status history found.</EmptyState>}
        </section>

        <section className="admin-card" aria-labelledby="handoff-history-title">
          <h2 id="handoff-history-title">Handoff history</h2>
          {handoffHistory.length ? <div className="admin-timeline">
            {handoffHistory.map((entry) => <div className="admin-timeline-item" key={entry.id}>
              <strong>{formatAdminLabel(entry.previous_status)} → {formatAdminLabel(entry.new_status)}</strong>
              <p>Source: {formatAdminLabel(entry.change_source)} · Handoff <span className="admin-code">{entry.handoff_id}</span></p>
              {entry.note ? <p>{entry.note}</p> : null}
              <div className="admin-timeline-meta">{formatAdminDate(entry.created_at)}</div>
            </div>)}
          </div> : <EmptyState>No handoff history found.</EmptyState>}
        </section>
      </div>
    </>
  );
}
