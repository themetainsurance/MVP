"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ComparisonLeadChoice } from "../../lib/comparison-admin-data";

export default function ComparisonCreateForm({ leads, initialLeadId }: { leads: ComparisonLeadChoice[]; initialLeadId: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: form.get("lead_id"),
          title: form.get("title"),
          internal_note: form.get("internal_note"),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.comparisonId) {
        throw new Error(result.error ?? "Comparison could not be created.");
      }
      router.push(`/admin/comparisons/${result.comparisonId}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Comparison could not be created.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <label>Lead reference
        <select name="lead_id" defaultValue={initialLeadId ?? ""} required>
          <option value="" disabled>Select a lead</option>
          {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.insurance_type.toUpperCase()} · {lead.status.replaceAll("_", " ")} · {new Date(lead.created_at).toLocaleDateString("en-GB")} · {lead.id}</option>)}
        </select>
      </label>
      <p className="admin-help">Insurance type is derived from the selected lead. Customer details are not copied into public comparison snapshots.</p>
      <label>Title<input name="title" required maxLength={180} placeholder="Factual policy comparison" /></label>
      <label>Internal note<textarea name="internal_note" maxLength={2000} placeholder="Optional administrator context" /></label>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <button className="admin-button admin-button-primary" type="submit" disabled={pending}>{pending ? "Creating…" : "Create draft comparison"}</button>
    </form>
  );
}
