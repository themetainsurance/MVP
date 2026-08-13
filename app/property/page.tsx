"use client";

import { useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

type PropertyForm = {
  propertyType: string;
  propertyUse: string;
  country: string;
  city: string;
  yearBuilt: string;
  propertySize: string;
  buildingValue: string;
  contentsValue: string;
  currentInsurer: string;
  currentPremium: string;
  deductible: string;
  coverageType: string;

  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
};

export default function PropertyInsurancePage() {
  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [policyPath, setPolicyPath] = useState<string | null>(null);

  const [form, setForm] = useState<PropertyForm>({
    propertyType: "",
    propertyUse: "",
    country: "",
    city: "",
    yearBuilt: "",
    propertySize: "",
    buildingValue: "",
    contentsValue: "",
    currentInsurer: "",
    currentPremium: "",
    deductible: "",
    coverageType: "",

    fullName: "",
    email: "",
    phone: "",
    preferredContact: "",
  });

  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateField(field: keyof PropertyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submitLead() {
    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      setError("Please enter an email address or phone number.");
      return;
    }

    if (mode === "upload" && !policyPath) {
      setError("Please upload your policy before submitting the request.");
      return;
    }

    if (!consent) {
      setError("Please confirm your consent before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          insurance_type: "property",
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          preferred_contact: form.preferredContact,
          consent: true,
          policy_document_path:
            mode === "upload" ? policyPath : null,
          details: {
            request_method: mode,
            property_type: form.propertyType,
            property_use: form.propertyUse,
            country: form.country,
            city: form.city,
            year_built: form.yearBuilt,
            property_size: form.propertySize,
            estimated_building_value: form.buildingValue,
            estimated_contents_value: form.contentsValue,
            current_insurer: form.currentInsurer,
            current_annual_premium: form.currentPremium,
            current_deductible: form.deductible,
            coverage_type: form.coverageType,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to submit your request."
        );
      }

      setSuccess(
        "Your property insurance request has been submitted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <header
        style={{
          height: "72px",
          padding: "0 7%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <a
          href="/"
          style={{
            textDecoration: "none",
            color: "#0f172a",
            fontSize: "22px",
            fontWeight: 800,
          }}
        >
          The Meta Insurance
        </a>

        <a
          href="/"
          style={{
            textDecoration: "none",
            color: "#0369a1",
            fontWeight: 700,
          }}
        >
          ← Back to home
        </a>
      </header>

      <section
        style={{
          background:
            "linear-gradient(135deg, #14532d 0%, #15803d 55%, #16a34a 100%)",
          color: "#ffffff",
          padding: "65px 7% 120px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              color: "#bbf7d0",
              fontSize: "13px",
              fontWeight: 800,
              marginBottom: "14px",
            }}
          >
            PROPERTY INSURANCE
          </div>

          <h1
            style={{
              fontSize: "48px",
              lineHeight: 1.1,
              margin: "0 0 18px",
            }}
          >
            Protect your property with the right cover.
          </h1>

          <p
            style={{
              maxWidth: "700px",
              color: "#dcfce7",
              fontSize: "18px",
              lineHeight: 1.6,
            }}
          >
            Enter your property information manually or upload your current
            policy to request a factual comparison of price, limits, coverage
            and exclusions from licensed insurance partners.
          </p>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1100px",
          margin: "-70px auto 0",
          padding: "0 24px 90px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "22px",
            boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={() => setMode("manual")}
              style={{
                padding: "24px",
                border: "none",
                cursor: "pointer",
                background: mode === "manual" ? "#dcfce7" : "#ffffff",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "16px",
              }}
            >
              🏠 Enter property details
            </button>

            <button
              type="button"
              onClick={() => setMode("upload")}
              style={{
                padding: "24px",
                border: "none",
                cursor: "pointer",
                background: mode === "upload" ? "#dcfce7" : "#ffffff",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "16px",
              }}
            >
              📄 Upload current policy
            </button>
          </div>

          <div style={{ padding: "38px" }}>
            {mode === "manual" ? (
              <ManualPropertyForm
                form={form}
                updateField={updateField}
              />
            ) : (
              <UploadPolicy
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                policyPath={policyPath}
                setPolicyPath={setPolicyPath}
              />
            )}

            <div
              style={{
                margin: "32px 0",
                borderTop: "1px solid #e2e8f0",
              }}
            />

            <h3>Contact information</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              <Field
                label="Full name"
                value={form.fullName}
                placeholder="Your full name"
                onChange={(value) => updateField("fullName", value)}
              />

              <Field
                label="Email address"
                value={form.email}
                placeholder="you@example.com"
                onChange={(value) => updateField("email", value)}
              />

              <Field
                label="Phone number"
                value={form.phone}
                placeholder="+389..."
                onChange={(value) => updateField("phone", value)}
              />

              <SelectField
                label="Preferred contact"
                value={form.preferredContact}
                options={["Email", "Phone", "WhatsApp"]}
                onChange={(value) => updateField("preferredContact", value)}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                marginTop: "28px",
                background: "#f8fafc",
                padding: "18px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                style={{ width: "18px", height: "18px" }}
              />

              <span
                style={{
                  color: "#475569",
                  lineHeight: 1.6,
                  fontSize: "14px",
                }}
              >
                I agree that my information may be processed for this
                insurance request and shared with relevant licensed insurance
                partners where applicable.
              </span>
            </label>

            <div
              style={{
                marginTop: "18px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                padding: "18px",
                borderRadius: "12px",
                color: "#92400e",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              The Meta Insurance operates as a technology and referral
              platform. Insurance offers, regulated advice and final
              recommendations are provided by licensed insurance partners.
            </div>

            {error && (
              <div
                style={{
                  marginTop: "18px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  marginTop: "18px",
                  background: "#ecfdf5",
                  border: "1px solid #86efac",
                  color: "#166534",
                  padding: "16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                }}
              >
                ✓ {success}
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={submitLead}
              style={{
                width: "100%",
                marginTop: "24px",
                background: submitting ? "#94a3b8" : "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? "Submitting request..."
                : "Request property insurance offers →"}
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "20px",
          }}
        >
          <InfoCard
            icon="🏡"
            title="Compare property cover"
            text="Compare your existing building and contents cover with offers supplied by licensed insurance partners."
          />

          <InfoCard
            icon="➕"
            title="See additional protection"
            text="Compare higher insured values, earthquake, flood, liability and alternative accommodation cover."
          />

          <InfoCard
            icon="⚖️"
            title="See the differences"
            text="Limits, deductibles, exclusions and price differences are displayed clearly side by side."
          />
        </div>

        <div
          style={{
            marginTop: "55px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "32px",
          }}
        >
          <div
            style={{
              color: "#16a34a",
              fontSize: "12px",
              fontWeight: 900,
              marginBottom: "10px",
            }}
          >
            EXAMPLE COMPARISON
          </div>

          <h2
            style={{
              marginTop: 0,
              fontSize: "28px",
            }}
          >
            Current property policy vs new offer
          </h2>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.6,
              marginBottom: "28px",
            }}
          >
            Customers can see factual differences between their current policy
            and an offer from a licensed insurance partner.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "680px",
              }}
            >
              <thead>
                <tr>
                  <TableHeader>Coverage</TableHeader>
                  <TableHeader>Current policy</TableHeader>
                  <TableHeader>New offer</TableHeader>
                  <TableHeader>Difference</TableHeader>
                </tr>
              </thead>

              <tbody>
                <ComparisonRow
                  name="Annual premium"
                  current="€180"
                  offer="€180"
                  difference="Same price"
                />

                <ComparisonRow
                  name="Building cover"
                  current="€100,000"
                  offer="€120,000"
                  difference="+ €20,000"
                />

                <ComparisonRow
                  name="Contents cover"
                  current="€20,000"
                  offer="€30,000"
                  difference="+ €10,000"
                />

                <ComparisonRow
                  name="Earthquake"
                  current="Not included"
                  offer="Included"
                  difference="+ Added"
                />

                <ComparisonRow
                  name="Personal liability"
                  current="€25,000"
                  offer="€50,000"
                  difference="+ €25,000"
                />

                <ComparisonRow
                  name="Alternative accommodation"
                  current="Not included"
                  offer="Included"
                  difference="+ Added"
                />
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: "28px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <strong style={{ color: "#166534" }}>
                + Example additional cover
              </strong>

              <ul
                style={{
                  color: "#166534",
                  lineHeight: 1.8,
                  paddingLeft: "20px",
                }}
              >
                <li>Higher building insured value</li>
                <li>Higher contents limit</li>
                <li>Earthquake cover added</li>
                <li>Higher personal liability</li>
                <li>Alternative accommodation added</li>
              </ul>
            </div>

            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <strong style={{ color: "#9a3412" }}>
                Important
              </strong>

              <p
                style={{
                  color: "#9a3412",
                  lineHeight: 1.7,
                  marginBottom: 0,
                }}
              >
                Final terms, eligibility, recommendations and regulated
                insurance advice are provided by the licensed insurance
                partner.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ManualPropertyForm({
  form,
  updateField,
}: {
  form: PropertyForm;
  updateField: (field: keyof PropertyForm, value: string) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "28px", marginTop: 0 }}>
        Tell us about your property
      </h2>

      <p
        style={{
          color: "#64748b",
          marginBottom: "30px",
          lineHeight: 1.6,
        }}
      >
        Enter the basic details required to request property insurance offers.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "18px",
        }}
      >
        <Field
          label="Property type"
          value={form.propertyType}
          placeholder="House / Apartment / Commercial"
          onChange={(value) => updateField("propertyType", value)}
        />

        <Field
          label="Property use"
          value={form.propertyUse}
          placeholder="Primary home / Rental / Holiday"
          onChange={(value) => updateField("propertyUse", value)}
        />

        <Field
          label="Country"
          value={form.country}
          placeholder="e.g. North Macedonia"
          onChange={(value) => updateField("country", value)}
        />

        <Field
          label="City"
          value={form.city}
          placeholder="e.g. Skopje"
          onChange={(value) => updateField("city", value)}
        />

        <Field
          label="Year built"
          value={form.yearBuilt}
          placeholder="e.g. 2015"
          onChange={(value) => updateField("yearBuilt", value)}
        />

        <Field
          label="Property size"
          value={form.propertySize}
          placeholder="e.g. 120 m²"
          onChange={(value) => updateField("propertySize", value)}
        />

        <Field
          label="Estimated building value"
          value={form.buildingValue}
          placeholder="e.g. €150,000"
          onChange={(value) => updateField("buildingValue", value)}
        />

        <Field
          label="Estimated contents value"
          value={form.contentsValue}
          placeholder="e.g. €30,000"
          onChange={(value) => updateField("contentsValue", value)}
        />

        <Field
          label="Current insurer"
          value={form.currentInsurer}
          placeholder="Optional"
          onChange={(value) => updateField("currentInsurer", value)}
        />

        <Field
          label="Current annual premium"
          value={form.currentPremium}
          placeholder="e.g. €220"
          onChange={(value) => updateField("currentPremium", value)}
        />

        <Field
          label="Current deductible"
          value={form.deductible}
          placeholder="e.g. €250"
          onChange={(value) => updateField("deductible", value)}
        />

        <Field
          label="Current coverage"
          value={form.coverageType}
          placeholder="Building / Contents / Combined"
          onChange={(value) => updateField("coverageType", value)}
        />
      </div>
    </div>
  );
}

function UploadPolicy({
  selectedFile,
  setSelectedFile,
  policyPath,
  setPolicyPath,
}: {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  policyPath: string | null;
  setPolicyPath: (path: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleFile(file: File | null) {
    setMessage("");
    setError("");
    setPolicyPath(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setError(
        "Unsupported file type. Please upload a PDF, JPG, JPEG or PNG file."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError(
        "The file is too large. Maximum allowed size is 10 MB."
      );
      return;
    }

    setSelectedFile(file);
  }

  async function uploadPolicy() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append("file", selectedFile);

      // IMPORTANT:
      // This tells our shared API to store the document
      // inside policy-documents/property/
      formData.append("category", "property");

      const response = await fetch("/api/upload-policy", {
        method: "POST",
        body: formData,
      });

      let result: {
        success?: boolean;
        category?: string;
        path?: string;
        error?: string;
      };

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again."
        );
      }

      if (!response.ok || !result.success || !result.path) {
        throw new Error(
          result.error || "The property policy could not be uploaded."
        );
      }

      setPolicyPath(result.path);

      setMessage(
        "Property policy uploaded successfully. Your document is ready to be submitted for comparison."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading the policy."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: "28px", marginTop: 0 }}>
        Upload your current property policy
      </h2>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.6,
          marginBottom: "28px",
        }}
      >
        Upload your existing policy and request a factual comparison with
        property insurance offers supplied by licensed insurance partners.
      </p>

      <label
        style={{
          display: "block",
          border: "2px dashed #94a3b8",
          borderRadius: "16px",
          padding: "55px 25px",
          textAlign: "center",
          cursor: "pointer",
          background: "#f8fafc",
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "14px" }}>
          📄
        </div>

        <div
          style={{
            fontWeight: 800,
            fontSize: "18px",
            marginBottom: "8px",
          }}
        >
          Upload current property policy
        </div>

        <div
          style={{
            color: "#64748b",
            marginBottom: "8px",
          }}
        >
          PDF, JPG, JPEG or PNG
        </div>

        <div
          style={{
            color: "#64748b",
            fontSize: "13px",
            marginBottom: "10px",
          }}
        >
          Maximum file size: 10 MB
        </div>

        <div
          style={{
            color: "#16a34a",
            fontWeight: 700,
          }}
        >
          Click to choose a file
        </div>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            handleFile(file);
          }}
        />
      </label>

      {selectedFile && (
        <div
          style={{
            marginTop: "20px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            padding: "16px",
            borderRadius: "10px",
            color: "#065f46",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: "5px" }}>
            ✓ File selected
          </div>

          <div>{selectedFile.name}</div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "13px",
            }}
          >
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: "20px",
            background: "#ecfdf5",
            border: "1px solid #86efac",
            padding: "17px",
            borderRadius: "10px",
            color: "#166534",
            fontWeight: 700,
          }}
        >
          ✓ {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "20px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "17px",
            borderRadius: "10px",
            color: "#b91c1c",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: "24px",
          background: "#f1f5f9",
          borderRadius: "12px",
          padding: "18px",
          color: "#475569",
          fontSize: "14px",
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: "#0f172a" }}>
          Your document is stored privately.
        </strong>

        <br />

        Uploaded property policies may contain personal information, so
        documents are stored in private storage rather than being exposed
        through a public URL.
      </div>

      <button
        type="button"
        disabled={!selectedFile || uploading}
        onClick={uploadPolicy}
        style={{
          width: "100%",
          marginTop: "24px",
          background:
            selectedFile && !uploading
              ? "#16a34a"
              : "#cbd5e1",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: 800,
          cursor:
            selectedFile && !uploading
              ? "pointer"
              : "not-allowed",
        }}
      >
        {uploading
          ? "Uploading property policy..."
          : policyPath
          ? "Property policy uploaded ✓"
          : "Upload property policy"}
      </button>

      {selectedFile && !uploading && (
        <button
          type="button"
          onClick={() => {
            setSelectedFile(null);
            setPolicyPath(null);
            setMessage("");
            setError("");
          }}
          style={{
            width: "100%",
            marginTop: "10px",
            background: "transparent",
            color: "#64748b",
            border: "none",
            padding: "10px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Remove selected file
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 800,
          marginBottom: "7px",
        }}
      >
        {label}
      </div>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: "9px",
          padding: "13px",
          fontSize: "14px",
          outline: "none",
        }}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 800,
          marginBottom: "7px",
        }}
      >
        {label}
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: "9px",
          padding: "13px",
          fontSize: "14px",
          outline: "none",
          background: "#ffffff",
        }}
      >
        <option value="">Select an option</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "24px",
      }}
    >
      <div style={{ fontSize: "28px" }}>
        {icon}
      </div>

      <h3>{title}</h3>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.6,
          marginBottom: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "14px",
        borderBottom: "2px solid #e2e8f0",
        color: "#475569",
        fontSize: "13px",
      }}
    >
      {children}
    </th>
  );
}

function ComparisonRow({
  name,
  current,
  offer,
  difference,
}: {
  name: string;
  current: string;
  offer: string;
  difference: string;
}) {
  return (
    <tr>
      <td
        style={{
          padding: "15px 14px",
          borderBottom: "1px solid #e2e8f0",
          fontWeight: 700,
        }}
      >
        {name}
      </td>

      <td
        style={{
          padding: "15px 14px",
          borderBottom: "1px solid #e2e8f0",
          color: "#64748b",
        }}
      >
        {current}
      </td>

      <td
        style={{
          padding: "15px 14px",
          borderBottom: "1px solid #e2e8f0",
          color: "#0f172a",
          fontWeight: 700,
        }}
      >
        {offer}
      </td>

      <td
        style={{
          padding: "15px 14px",
          borderBottom: "1px solid #e2e8f0",
          color: "#16a34a",
          fontWeight: 800,
        }}
      >
        {difference}
      </td>
    </tr>
  );
}
