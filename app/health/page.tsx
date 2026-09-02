"use client";

import { useState, type SyntheticEvent } from "react";
import BrandLogo from "../components/BrandLogo";
import HealthInsuranceIcon from "../components/HealthInsuranceIcon";
import SiteFooter from "../components/SiteFooter";
import { useAnalytics } from "../components/AnalyticsProvider";
import { createSafeApiError, getSafeApiErrorMessage } from "../lib/safe-api-error";
import { policyUploadStageMessage, uploadPolicyDocumentDirectly } from "../lib/policy-upload-client";
import styles from "./HealthInsurancePage.module.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

type HealthForm = {
  planType: string;
  country: string;
  coverageArea: string;
  applicantAgeRange: string;
  householdSize: string;
  currentInsurer: string;
  currentPremium: string;
  deductible: string;
  coveragePriorities: string;
  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
};

const initialForm: HealthForm = {
  planType: "", country: "", coverageArea: "", applicantAgeRange: "",
  householdSize: "", currentInsurer: "", currentPremium: "", deductible: "",
  coveragePriorities: "", fullName: "", email: "", phone: "", preferredContact: "",
};

export default function HealthInsurancePage() {
  const { getAnalyticsSessionId, trackFormStarted } = useAnalytics();
  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [policyPath, setPolicyPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function trackFormInteraction(event: SyntheticEvent) {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
      trackFormStarted({ insuranceType: "health", formMode: mode });
    }
  }

  function updateField(field: keyof HealthForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleFile(file: File | null) {
    setError(""); setUploadMessage(""); setPolicyPath(null);
    if (!file) return setSelectedFile(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectedFile(null); setError("Unsupported file type. Please upload a PDF, JPG, JPEG or PNG file."); return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null); setError("The file is too large. Maximum allowed size is 10 MB."); return;
    }
    setSelectedFile(file);
  }

  async function uploadPolicy() {
    if (!selectedFile) return;
    try {
      setUploading(true); setError(""); setUploadMessage("");
      const path = await uploadPolicyDocumentDirectly({
        file: selectedFile,
        category: "health",
        onStage(stage) { setUploadStage(policyUploadStageMessage(stage)); },
      });
      setPolicyPath(path);
      setUploadMessage("Health policy uploaded successfully and is ready for your request.");
    } catch (uploadError) {
      setError(getSafeApiErrorMessage(uploadError, "Document upload failed. Please try again."));
    } finally { setUploading(false); setUploadStage(""); }
  }

  async function submitLead() {
    setError(""); setSuccess("");
    if (!form.fullName.trim()) return setError("Please enter your full name.");
    if (!form.email.trim() && !form.phone.trim()) return setError("Please enter an email address or phone number.");
    if (mode === "upload" && !policyPath) return setError("Please upload your policy before submitting the request.");
    if (!consent) return setError("Please confirm your consent before submitting.");
    try {
      setSubmitting(true);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insurance_type: "health",
          analytics_session_id: getAnalyticsSessionId() ?? undefined,
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          preferred_contact: form.preferredContact,
          consent: true,
          policy_document_path: mode === "upload" ? policyPath : null,
          details: {
            request_method: mode,
            plan_type: form.planType,
            country: form.country,
            coverage_area: form.coverageArea,
            applicant_age_range: form.applicantAgeRange,
            household_size: form.householdSize,
            current_insurer: form.currentInsurer,
            current_annual_premium: form.currentPremium,
            current_deductible: form.deductible,
            coverage_priorities: form.coveragePriorities,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw createSafeApiError(result.error, "Unable to submit your request.");
      setSuccess("Your health insurance request has been submitted successfully.");
    } catch (submitError) {
      setError(getSafeApiErrorMessage(submitError, "Something went wrong."));
    } finally { setSubmitting(false); }
  }

  return (
    <main className={styles.page} onFocusCapture={trackFormInteraction} onChangeCapture={trackFormInteraction}>
      <header className={styles.header}>
        <a className={styles.brand} href="/"><BrandLogo /></a>
        <a className={styles.back} href="/">← Back to home</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>HEALTH INSURANCE</div>
            <h1>Explore health insurance options.</h1>
            <p>Enter general plan information or upload your current policy to organise the details you want to compare and request options from relevant licensed insurance partners.</p>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <span className={styles.heroOrbit} />
            <span className={styles.heroOrbitSecondary} />
            <div className={styles.heroIconShell}>
              <HealthInsuranceIcon className={styles.heroIcon} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.panel}>
          <div className={styles.tabs}>
            <button type="button" className={`${styles.tab} ${mode === "manual" ? styles.tabActive : ""}`} onClick={() => setMode("manual")}><HealthInsuranceIcon className={styles.tabIcon} /> Enter coverage details</button>
            <button type="button" className={`${styles.tab} ${mode === "upload" ? styles.tabActive : ""}`} onClick={() => setMode("upload")}><span aria-hidden="true">📄</span> Upload current policy</button>
          </div>

          <div className={styles.form}>
            {mode === "manual" ? (
              <>
                <h2>Tell us about the cover you need</h2>
                <p className={styles.muted}>Provide general plan information only. Do not enter diagnoses, treatment records or other detailed medical information.</p>
                <div className={styles.grid}>
                  <SelectField label="Plan type" value={form.planType} options={["Individual", "Family", "Short-term", "International / Expat", "Employer / Group"]} onChange={(value) => updateField("planType", value)} />
                  <Field label="Country of residence" value={form.country} placeholder="e.g. Germany" onChange={(value) => updateField("country", value)} />
                  <SelectField label="Coverage area" value={form.coverageArea} options={["Domestic", "Europe", "Worldwide excluding USA", "Worldwide including USA"]} onChange={(value) => updateField("coverageArea", value)} />
                  <SelectField label="Applicant age range" value={form.applicantAgeRange} options={["18–25", "26–35", "36–45", "46–55", "56–64", "65+"]} onChange={(value) => updateField("applicantAgeRange", value)} />
                  <Field label="People to cover" value={form.householdSize} placeholder="e.g. 2 adults, 1 child" onChange={(value) => updateField("householdSize", value)} />
                  <Field label="Current insurer" value={form.currentInsurer} placeholder="Optional" onChange={(value) => updateField("currentInsurer", value)} />
                  <Field label="Current annual premium" value={form.currentPremium} placeholder="e.g. €1,800" onChange={(value) => updateField("currentPremium", value)} />
                  <Field label="Current deductible / excess" value={form.deductible} placeholder="e.g. €500" onChange={(value) => updateField("deductible", value)} />
                  <div style={{ gridColumn: "1 / -1" }}><Field label="Coverage priorities" value={form.coveragePriorities} placeholder="e.g. hospital, outpatient, dental — no medical history" onChange={(value) => updateField("coveragePriorities", value)} /></div>
                </div>
              </>
            ) : (
              <>
                <h2>Upload your current health policy</h2>
                <p className={styles.muted}>Upload the policy wording or benefit schedule you are authorised to provide. Avoid uploading medical records, claim files or treatment documents.</p>
                <label className={styles.upload}>
                  <div style={{ fontSize: 42 }}>📄</div><h3>Select your current policy</h3>
                  <p className={styles.muted}>PDF, JPG, JPEG or PNG — maximum 10 MB</p>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => handleFile(event.target.files?.[0] || null)} />
                </label>
                {selectedFile && <div className={styles.success}>✓ {selectedFile.name}</div>}
                {uploadMessage && <div className={styles.success}>✓ {uploadMessage}</div>}
                <div className={styles.privacyNote}><strong>Private document handling</strong><br />Policy documents can contain sensitive information. Upload only the insurance policy or benefit schedule needed for this request, and remove unrelated medical information where possible.</div>
                <button type="button" className={styles.button} disabled={!selectedFile || uploading || Boolean(policyPath)} onClick={uploadPolicy}>{uploading ? uploadStage || "Preparing secure upload..." : policyPath ? "Policy uploaded ✓" : "Upload policy"}</button>
              </>
            )}

            <div className={styles.divider} />
            <h3>Contact information</h3>
            <div className={styles.grid}>
              <Field label="Full name" value={form.fullName} placeholder="Your full name" onChange={(value) => updateField("fullName", value)} />
              <Field label="Email address" value={form.email} placeholder="you@example.com" onChange={(value) => updateField("email", value)} />
              <Field label="Phone number" value={form.phone} placeholder="Optional unless phone contact is preferred" onChange={(value) => updateField("phone", value)} />
              <SelectField label="Preferred contact" value={form.preferredContact} options={["Email", "Phone", "WhatsApp"]} onChange={(value) => updateField("preferredContact", value)} />
            </div>

            <label className={styles.consent}>
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>I agree to the <a href="/terms">Terms</a> and acknowledge the <a href="/privacy">Privacy Policy</a>. I consent to The Meta Insurance processing my request and sharing the submitted information with relevant licensed insurance providers or partners where applicable.</span>
            </label>
            <p className={styles.tcpa}>If you provide a phone number and choose Phone or WhatsApp, you consent to receive calls or messages about this request from The Meta Insurance and relevant insurance partners, which may use automated technology where permitted. Consent is not a condition of purchase. Message and data rates may apply. You may revoke consent by replying STOP or contacting the caller or sender. This notice is a general template and must be reviewed for the jurisdictions in which it is used.</p>
            <div className={styles.legal}>The Meta Insurance is an independent insurance discovery and referral platform. We do not underwrite, bind, issue or sell insurance, determine eligibility or pricing, or provide regulated insurance or medical advice. Relevant licensed insurance partners determine final terms and coverage availability.</div>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>✓ {success}</div>}
            <button type="button" className={styles.button} disabled={submitting} onClick={submitLead}>{submitting ? "Submitting request..." : "Request health insurance options →"}</button>
          </div>
        </div>

        <HealthComparison />
      </section>
      <SiteFooter />
    </main>
  );
}

function HealthComparison() {
  const rows = [
    ["Annual premium", "€1,800", "€1,800", "Same price"],
    ["Annual deductible", "€750", "€500", "€250 lower"],
    ["Hospitalisation", "Included", "Included", "Comparable"],
    ["Outpatient care", "Limited", "Included", "+ Upgraded"],
    ["Mental health", "Not included", "Included", "+ Added"],
    ["Dental", "Not included", "Optional", "+ Available"],
  ];
  const steps = [
    ["✚", "Compare plan information", "Compare factual differences in premiums, deductibles, provider networks, limits and selected benefits."],
    ["➕", "Review health benefits", "Review hospital, outpatient, emergency, prescription, mental health and optional benefits."],
    ["⚖️", "See the differences", "Plan costs, limits, exclusions, waiting periods and coverage differences are shown side by side."],
  ];
  return <>
    <div className={styles.steps}>{steps.map(([icon,title,text]) => <article className={styles.step} key={title}><div className={styles.stepIcon} aria-hidden="true">{icon}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
    <section className={styles.comparison} aria-labelledby="health-comparison-title">
      <div className={styles.comparisonEyebrow}>EXAMPLE COMPARISON</div>
      <h2 id="health-comparison-title">Current health policy vs new offer</h2>
      <p className={styles.muted}>Customers can see factual differences between their current policy and an offer from a licensed insurance partner.</p>
      <div className={styles.tableWrap} role="region" aria-label="Example health insurance comparison" tabIndex={0}>
        <table className={styles.table}><thead><tr>{["Coverage", "Current policy", "New offer", "Difference"].map((heading) => <th scope="col" key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map(([name,current,offer,difference]) => <tr key={name}><th scope="row">{name}</th><td>{current}</td><td>{offer}</td><td>{difference}</td></tr>)}</tbody></table>
      </div>
      <p className={styles.illustrative}>All figures are illustrative examples only, not actual or personalised insurance quotes.</p>
      <div className={styles.summaries}>
        <div className={styles.added}><strong>+ Example additional cover</strong><ul><li>Lower annual deductible</li><li>Outpatient care added</li><li>Mental health benefit added</li><li>Optional dental cover available</li><li>Clearer provider-network terms</li></ul></div>
        <aside className={styles.important}><strong>Important</strong><p>This example does not constitute an insurance quote, recommendation or guarantee of coverage. Final terms, eligibility, medical underwriting where lawful, pricing, waiting periods and coverage availability are determined solely by the relevant licensed insurance provider.</p><p>The Meta Insurance does not provide medical advice or determine which health plan is suitable for you.</p></aside>
      </div>
    </section>
  </>;
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className={styles.field}><span className={styles.label}>{label}</span><input className={styles.input} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className={styles.field}><span className={styles.label}>{label}</span><select className={styles.input} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select an option</option>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>;
}
