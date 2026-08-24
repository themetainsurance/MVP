"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getComparisonDefinitions, notStatedFact } from "../../lib/comparison-definitions";
import type {
  ComparisonFact,
  ComparisonHandoffChoice,
  ComparisonPartnerChoice,
  InsuranceComparisonFacts,
  PolicyComparison,
  PolicyComparisonOption,
  PolicyComparisonShare,
} from "../../lib/comparison-types";

async function request(endpoint: string, method: string, body?: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error ?? "Operation could not be completed.");
  return result;
}

function FactEditor({ insuranceType, facts, onChange, disabled }: {
  insuranceType: PolicyComparison["insurance_type"];
  facts: InsuranceComparisonFacts;
  onChange: (facts: InsuranceComparisonFacts) => void;
  disabled: boolean;
}) {
  const definitions = getComparisonDefinitions(insuranceType);
  const sections = [...new Set(definitions.map((definition) => definition.section))];
  function setFact(key: keyof InsuranceComparisonFacts, fact: ComparisonFact) {
    onChange({ ...facts, [key]: fact });
  }

  return <div className="admin-facts-editor">
    {sections.map((section) => <fieldset key={section} disabled={disabled}>
      <legend>{section}</legend>
      <div className="admin-facts-grid">
        {definitions.filter((definition) => definition.section === section).map((definition) => {
          const fact = facts[definition.key] ?? notStatedFact(definition.kind);
          return <div className="admin-fact" key={definition.key}>
            <strong>{definition.label}</strong>
            {fact.kind === "coverage" ? <>
              <label>Status<select value={fact.status} onChange={(event) => setFact(definition.key, { kind: "coverage", status: event.target.value as typeof fact.status })}>
                <option value="included">Included</option><option value="not_included">Not included</option><option value="optional">Optional</option><option value="not_stated">Not stated</option><option value="not_applicable">Not applicable</option>
              </select></label>
              {["included", "optional"].includes(fact.status) ? <div className="admin-mini-grid">
                <label>Limit amount<input inputMode="decimal" value={fact.limit_amount ?? ""} onChange={(event) => setFact(definition.key, { ...fact, limit_amount: event.target.value || undefined, limit_currency: fact.limit_currency })} /></label>
                <label>Currency<input maxLength={3} value={fact.limit_currency ?? ""} onChange={(event) => setFact(definition.key, { ...fact, limit_currency: event.target.value.toUpperCase() || undefined, limit_amount: fact.limit_amount })} /></label>
              </div> : null}
              <label>Factual note<input maxLength={300} value={fact.note ?? ""} onChange={(event) => setFact(definition.key, { ...fact, note: event.target.value || undefined })} /></label>
            </> : <>
              <label>State<select value={fact.state} onChange={(event) => setFact(definition.key, { kind: fact.kind, state: event.target.value as typeof fact.state } as ComparisonFact)}>
                <option value="stated">Stated</option><option value="not_stated">Not stated</option><option value="not_applicable">Not applicable</option>
              </select></label>
              {fact.state === "stated" && fact.kind === "money" ? <div className="admin-mini-grid">
                <label>Amount<input inputMode="decimal" value={fact.amount ?? ""} onChange={(event) => setFact(definition.key, { ...fact, amount: event.target.value })} /></label>
                <label>Currency<input maxLength={3} value={fact.currency ?? ""} onChange={(event) => setFact(definition.key, { ...fact, currency: event.target.value.toUpperCase() })} /></label>
              </div> : null}
              {fact.state === "stated" && fact.kind === "number" ? <div className="admin-mini-grid">
                <label>Value<input inputMode="decimal" value={fact.value ?? ""} onChange={(event) => setFact(definition.key, { ...fact, value: event.target.value })} /></label>
                <label>Unit<input maxLength={30} value={fact.unit ?? ""} onChange={(event) => setFact(definition.key, { ...fact, unit: event.target.value })} /></label>
              </div> : null}
              {fact.state === "stated" && fact.kind === "text" ? <label>Text<textarea maxLength={500} value={fact.value ?? ""} onChange={(event) => setFact(definition.key, { ...fact, value: event.target.value })} /></label> : null}
            </>}
          </div>;
        })}
      </div>
    </fieldset>)}
  </div>;
}

function OptionEditor({ comparison, option, partners, handoffs }: {
  comparison: PolicyComparison;
  option: PolicyComparisonOption;
  partners: ComparisonPartnerChoice[];
  handoffs: ComparisonHandoffChoice[];
}) {
  const router = useRouter();
  const [facts, setFacts] = useState(option.facts);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const disabled = comparison.status !== "draft" || option.status !== "active";
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      await request(`/api/admin/comparisons/${comparison.id}/options/${option.id}`, "PATCH", {
        provider_name: form.get("provider_name"), product_name: form.get("product_name"), internal_reference: form.get("internal_reference"), effective_from: form.get("effective_from"), effective_to: form.get("effective_to"), facts, customer_note: form.get("customer_note"), internal_note: form.get("internal_note"), sort_order: Number(form.get("sort_order")),
      });
      setMessage("Option saved."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Option could not be saved."); }
    finally { setPending(false); }
  }
  async function remove() {
    if (!window.confirm("Remove this option from the working comparison?")) return;
    setPending(true); setMessage(null);
    try { await request(`/api/admin/comparisons/${comparison.id}/options/${option.id}/remove`, "POST"); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Option could not be removed."); }
    finally { setPending(false); }
  }
  const partnerName = partners.find((partner) => partner.id === option.partner_id)?.name;
  const handoff = handoffs.find((item) => item.id === option.handoff_id);
  return <details className="admin-option-card" open={option.option_type === "current_policy" && option.status === "active"}>
    <summary><strong>{option.option_type === "current_policy" ? "Current policy" : partnerName ?? option.provider_name}</strong><span>{option.status}</span></summary>
    <form className="admin-form admin-section" onSubmit={save}>
      {option.option_type === "partner_offer" ? <p className="admin-help">Partner relationship: {partnerName ?? "Partner"}{handoff ? ` · handoff ${handoff.id} (${handoff.status})` : " · no handoff linked"}</p> : null}
      <div className="admin-grid admin-grid-2">
        <label>Provider name<input name="provider_name" required maxLength={200} defaultValue={option.provider_name} disabled={disabled} /></label>
        <label>Product / policy name<input name="product_name" maxLength={200} defaultValue={option.product_name ?? ""} disabled={disabled} /></label>
        <label>Effective from<input name="effective_from" type="date" defaultValue={option.effective_from ?? ""} disabled={disabled} /></label>
        <label>Effective to<input name="effective_to" type="date" defaultValue={option.effective_to ?? ""} disabled={disabled} /></label>
        <label>Sort order<input name="sort_order" type="number" min={0} max={100} defaultValue={option.sort_order} disabled={disabled} /></label>
        <label>Internal reference<input name="internal_reference" maxLength={250} defaultValue={option.internal_reference ?? ""} disabled={disabled} /></label>
      </div>
      <label>Customer-visible note<textarea name="customer_note" maxLength={1000} defaultValue={option.customer_note ?? ""} disabled={disabled} /></label>
      <label>Internal note<textarea name="internal_note" maxLength={2000} defaultValue={option.internal_note ?? ""} disabled={disabled} /></label>
      <FactEditor insuranceType={comparison.insurance_type} facts={facts} onChange={setFacts} disabled={disabled} />
      {message ? <p className={message === "Option saved." ? "admin-form-success" : "admin-form-error"}>{message}</p> : null}
      {!disabled ? <div className="admin-actions-row"><button className="admin-button admin-button-primary" disabled={pending}>Save option</button><button className="admin-button admin-button-danger" type="button" disabled={pending} onClick={remove}>Remove from comparison</button></div> : null}
    </form>
  </details>;
}

function AddOption({ comparison, partners, handoffs, hasCurrent, activeOfferCount }: { comparison: PolicyComparison; partners: ComparisonPartnerChoice[]; handoffs: ComparisonHandoffChoice[]; hasCurrent: boolean; activeOfferCount: number }) {
  const router = useRouter();
  const definitions = getComparisonDefinitions(comparison.insurance_type);
  const initialFacts = Object.fromEntries(definitions.map((definition) => [definition.key, notStatedFact(definition.kind)])) as InsuranceComparisonFacts;
  const [optionType, setOptionType] = useState<"current_policy" | "partner_offer">(hasCurrent ? "partner_offer" : "current_policy");
  const [partnerId, setPartnerId] = useState("");
  const [providerName, setProviderName] = useState("");
  const [facts, setFacts] = useState(initialFacts);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableHandoffs = handoffs.filter((handoff) => handoff.partner_id === partnerId);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await request(`/api/admin/comparisons/${comparison.id}/options`, "POST", {
        option_type: optionType, partner_id: optionType === "partner_offer" ? partnerId : null, handoff_id: optionType === "partner_offer" ? form.get("handoff_id") : null, provider_name: providerName, product_name: form.get("product_name"), internal_reference: form.get("internal_reference"), effective_from: form.get("effective_from"), effective_to: form.get("effective_to"), facts, customer_note: form.get("customer_note"), internal_note: form.get("internal_note"), sort_order: Number(form.get("sort_order")),
      });
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Option could not be added."); }
    finally { setPending(false); }
  }
  return <details className="admin-card" open={!hasCurrent}>
    <summary><strong>Add policy option</strong></summary>
    <form className="admin-form admin-section" onSubmit={submit}>
      <label>Option type<select value={optionType} onChange={(event) => { const value = event.target.value as typeof optionType; setOptionType(value); if (value === "current_policy") { setPartnerId(""); setProviderName(""); } }}>
        {!hasCurrent ? <option value="current_policy">Current policy</option> : null}<option value="partner_offer" disabled={activeOfferCount >= 5}>Partner offer</option>
      </select></label>
      {optionType === "partner_offer" ? <>
        <label>Active capable partner<select required value={partnerId} onChange={(event) => { setPartnerId(event.target.value); setProviderName(partners.find((partner) => partner.id === event.target.value)?.name ?? ""); }}><option value="" disabled>Select partner</option>{partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}</select></label>
        <label>Related handoff (optional)<select name="handoff_id" defaultValue=""><option value="">No linked handoff</option>{availableHandoffs.map((handoff) => <option key={handoff.id} value={handoff.id}>{handoff.id} · {handoff.status}</option>)}</select></label>
      </> : null}
      <div className="admin-grid admin-grid-2">
        <label>Provider name<input required maxLength={200} value={providerName} onChange={(event) => setProviderName(event.target.value)} /></label>
        <label>Product / policy name<input name="product_name" maxLength={200} /></label>
        <label>Effective from<input name="effective_from" type="date" /></label><label>Effective to<input name="effective_to" type="date" /></label>
        <label>Sort order<input name="sort_order" type="number" min={0} max={100} defaultValue={optionType === "current_policy" ? 0 : activeOfferCount + 1} /></label>
        <label>Internal reference<input name="internal_reference" maxLength={250} /></label>
      </div>
      <label>Customer-visible note<textarea name="customer_note" maxLength={1000} /></label><label>Internal note<textarea name="internal_note" maxLength={2000} /></label>
      <FactEditor insuranceType={comparison.insurance_type} facts={facts} onChange={setFacts} disabled={false} />
      {error ? <p className="admin-form-error">{error}</p> : null}
      <button className="admin-button admin-button-primary" disabled={pending || (optionType === "partner_offer" && activeOfferCount >= 5)}>{pending ? "Adding…" : "Add option"}</button>
    </form>
  </details>;
}

export default function ComparisonWorkspace({ comparison, options, shares, partners, handoffs }: { comparison: PolicyComparison; options: PolicyComparisonOption[]; shares: PolicyComparisonShare[]; partners: ComparisonPartnerChoice[]; handoffs: ComparisonHandoffChoice[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const activeOptions = useMemo(() => options.filter((option) => option.status === "active"), [options]);
  const hasCurrent = activeOptions.some((option) => option.option_type === "current_policy");
  const activeOfferCount = activeOptions.filter((option) => option.option_type === "partner_offer").length;
  async function saveMetadata(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(null); const form = new FormData(event.currentTarget);
    try { await request(`/api/admin/comparisons/${comparison.id}`, "PATCH", { title: form.get("title"), customer_intro: form.get("customer_intro"), internal_note: form.get("internal_note") }); setMessage("Overview saved."); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Overview could not be saved."); } finally { setPending(false); }
  }
  async function setStatus(status: PolicyComparison["status"]) {
    setPending(true); setMessage(null);
    try { await request(`/api/admin/comparisons/${comparison.id}/status`, "POST", { status }); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Status could not be changed."); } finally { setPending(false); }
  }
  async function createShare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setShareMessage(null); setShareUrl(null); const form = new FormData(event.currentTarget);
    try { const result = await request(`/api/admin/comparisons/${comparison.id}/shares`, "POST", { expiry_days: Number(form.get("expiry_days")) }); setShareUrl(new URL(result.shareUrl, window.location.origin).toString()); setShareMessage("Copy this link now. It will not be shown again after you leave this page."); router.refresh(); }
    catch (error) { setShareMessage(error instanceof Error ? error.message : "Comparison link could not be created."); } finally { setPending(false); }
  }
  async function revoke(shareId: string) {
    if (!window.confirm("Revoke this comparison link?")) return; setPending(true);
    try { await request(`/api/admin/comparisons/${comparison.id}/shares/${shareId}/revoke`, "POST"); router.refresh(); }
    catch (error) { setShareMessage(error instanceof Error ? error.message : "Comparison link could not be revoked."); } finally { setPending(false); }
  }
  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Customer link copied. It will not be shown again after you leave this page.");
    } catch {
      setShareMessage("Select and copy the one-time link manually.");
    }
  }
  return <div className="admin-grid">
    <section className="admin-card"><h2>Overview</h2><form className="admin-form" onSubmit={saveMetadata}>
      <label>Title<input name="title" maxLength={180} required defaultValue={comparison.title} disabled={comparison.status !== "draft"} /></label>
      <label>Customer introduction<textarea name="customer_intro" maxLength={1000} defaultValue={comparison.customer_intro ?? ""} disabled={comparison.status !== "draft"} /></label>
      <label>Internal note<textarea name="internal_note" maxLength={2000} defaultValue={comparison.internal_note ?? ""} disabled={comparison.status !== "draft"} /></label>
      {comparison.status === "draft" ? <button className="admin-button admin-button-primary" disabled={pending}>Save overview</button> : null}
    </form><div className="admin-actions-row admin-section">
      {comparison.status === "draft" ? <button className="admin-button admin-button-primary" onClick={() => setStatus("ready")} disabled={pending}>Mark ready</button> : null}
      {comparison.status === "ready" ? <button className="admin-button admin-button-secondary" onClick={() => setStatus("draft")} disabled={pending}>Return to draft</button> : null}
      {comparison.status !== "archived" ? <button className="admin-button admin-button-danger" onClick={() => setStatus("archived")} disabled={pending}>Archive</button> : <button className="admin-button admin-button-secondary" onClick={() => setStatus("draft")} disabled={pending}>Restore as draft</button>}
    </div>{message ? <p className={/saved|copy|copied/i.test(message) ? "admin-form-success" : "admin-form-error"}>{message}</p> : null}</section>

    <section className="admin-section"><div className="admin-section-heading"><h2>Current policy and partner offers</h2></div>
      <div className="admin-grid">{options.map((option) => <OptionEditor key={option.id} comparison={comparison} option={option} partners={partners} handoffs={handoffs} />)}
      {comparison.status === "draft" && (!hasCurrent || activeOfferCount < 5) ? <AddOption comparison={comparison} partners={partners} handoffs={handoffs} hasCurrent={hasCurrent} activeOfferCount={activeOfferCount} /> : null}</div>
    </section>

    <section className="admin-card"><h2>Sharing</h2><p className="admin-help">A link uses an immutable customer-safe snapshot. Existing links never change when this draft is edited.</p>
      {comparison.status === "ready" ? <form className="admin-inline-form" onSubmit={createShare}><label>Expires after<select name="expiry_days" defaultValue="14"><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></label><button className="admin-button admin-button-primary" disabled={pending}>Create private link</button></form> : <p className="admin-warning">Mark the comparison ready before creating a share link.</p>}
      {shareUrl ? <div className="admin-share-once"><strong>One-time share URL</strong><input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} /><button className="admin-button admin-button-secondary" type="button" onClick={copyShareUrl}>Copy customer link</button></div> : null}
      {shareMessage ? <p className={/copied|copy this/i.test(shareMessage) ? "admin-form-success" : "admin-form-error"}>{shareMessage}</p> : null}
      <div className="admin-table-wrap admin-section"><table className="admin-table admin-table-compact"><thead><tr><th>Created</th><th>Expires</th><th>Version</th><th>Status</th><th>Action</th></tr></thead><tbody>{shares.length ? shares.map((share) => { const active = !share.revoked_at && new Date(share.expires_at) > new Date(); return <tr key={share.id}><td>{new Date(share.created_at).toLocaleString()}</td><td>{new Date(share.expires_at).toLocaleString()}</td><td>{share.source_version}</td><td>{share.revoked_at ? "Revoked" : active ? "Active" : "Expired"}</td><td>{active ? <button className="admin-button admin-button-danger" onClick={() => revoke(share.id)} disabled={pending}>Revoke</button> : "—"}</td></tr>; }) : <tr><td colSpan={5}>No links created.</td></tr>}</tbody></table></div>
    </section>
  </div>;
}
