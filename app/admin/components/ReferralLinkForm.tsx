"use client";

import { useState, type FormEvent } from "react";

export default function ReferralLinkForm({
  destinationId,
  leadId = null,
  handoffId = null,
  comparisonId = null,
  comparisonShareId = null,
}: {
  destinationId: string;
  leadId?: string | null;
  handoffId?: string | null;
  comparisonId?: string | null;
  comparisonShareId?: string | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [referralUrl, setReferralUrl] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setReferralUrl("");
    const form = event.currentTarget;
    const expiryDays = new FormData(form).get("expiry_days");
    try {
      const response = await fetch("/api/admin/referral-links", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_id: destinationId,
          expiry_days: expiryDays,
          lead_id: leadId,
          handoff_id: handoffId,
          comparison_id: comparisonId,
          comparison_share_id: comparisonShareId,
        }),
      });
      const result = await response.json().catch(() => null) as { success?: boolean; error?: string; referralUrl?: string } | null;
      if (!response.ok || !result?.success || !result.referralUrl) {
        setError(result?.error ?? "Referral link could not be created.");
        return;
      }
      setReferralUrl(new URL(result.referralUrl, window.location.origin).toString());
    } catch {
      setError("Referral link could not be created.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={submit} noValidate>
      <label>Expires after
        <select name="expiry_days" defaultValue="14">
          {[1, 7, 14, 30].map((days) => <option key={days} value={days}>{days} day{days === 1 ? "" : "s"}</option>)}
        </select>
      </label>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      {referralUrl ? (
        <div className="admin-share-once" role="status">
          <strong>Copy this link now</strong>
          <p className="admin-help">The raw token is shown only in this response and is not stored.</p>
          <input aria-label="Generated referral URL" readOnly value={referralUrl} onFocus={(event) => event.currentTarget.select()} />
          <button className="admin-button admin-button-secondary" type="button" onClick={() => navigator.clipboard.writeText(referralUrl)}>
            Copy referral link
          </button>
        </div>
      ) : null}
      <button className="admin-button admin-button-primary" type="submit" disabled={pending}>
        {pending ? "Generating…" : "Generate referral link"}
      </button>
    </form>
  );
}
