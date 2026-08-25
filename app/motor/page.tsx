"use client";

import { useState, type SyntheticEvent } from "react";
import SiteFooter from "../components/SiteFooter";
import { useAnalytics } from "../components/AnalyticsProvider";
import {
  createSafeApiError,
  getSafeApiErrorMessage,
} from "../lib/safe-api-error";
import {
  policyUploadStageMessage,
  uploadPolicyDocumentDirectly,
} from "../lib/policy-upload-client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

type MotorForm = {
  make: string;
  model: string;
  year: string;
  registrationCountry: string;
  fuelType: string;
  enginePower: string;
  currentInsurer: string;
  currentPremium: string;
  deductible: string;
  coverageType: string;

  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
};

export default function MotorInsurancePage() {
  const { getAnalyticsSessionId, trackFormStarted } = useAnalytics();
  const [mode, setMode] =
    useState<"manual" | "upload">("manual");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [policyPath, setPolicyPath] =
    useState<string | null>(null);

  const [form, setForm] = useState<MotorForm>({
    make: "",
    model: "",
    year: "",
    registrationCountry: "",
    fuelType: "",
    enginePower: "",
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

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadStage, setUploadStage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function trackFormInteraction(event: SyntheticEvent) {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      trackFormStarted({ insuranceType: "motor", formMode: mode });
    }
  }

  function updateField(
    field: keyof MotorForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleFile(file: File | null) {
    setError("");
    setUploadMessage("");
    setUploadStage("");
    setPolicyPath(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setError(
        "Please upload a PDF, JPG, JPEG or PNG file."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError(
        "Maximum allowed file size is 10 MB."
      );
      return;
    }

    setSelectedFile(file);
  }

  async function uploadPolicy() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError("");
      setUploadMessage("");
      const path = await uploadPolicyDocumentDirectly({
        file: selectedFile,
        category: "motor",
        onStage(stage) {
          setUploadStage(policyUploadStageMessage(stage));
        },
      });

      setPolicyPath(path);

      setUploadMessage(
        "Policy uploaded successfully."
      );
    } catch (err) {
      setError(
        getSafeApiErrorMessage(
          err,
          "Document upload failed. Please try again."
        )
      );
    } finally {
      setUploading(false);
      setUploadStage("");
    }
  }

  async function submitLead() {
    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (
      !form.email.trim() &&
      !form.phone.trim()
    ) {
      setError(
        "Please enter an email address or phone number."
      );
      return;
    }

    if (mode === "upload" && !policyPath) {
      setError(
        "Please upload your policy before submitting the request."
      );
      return;
    }

    if (!consent) {
      setError(
        "Please confirm your consent before submitting."
      );
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
          insurance_type: "motor",
          analytics_session_id: getAnalyticsSessionId() ?? undefined,

          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          preferred_contact:
            form.preferredContact,

          consent: true,

          policy_document_path:
            policyPath || null,

          details: {
            request_method: mode,

            vehicle_make: form.make,
            vehicle_model: form.model,
            vehicle_year: form.year,

            registration_country:
              form.registrationCountry,

            fuel_type: form.fuelType,
            engine_power: form.enginePower,

            current_insurer:
              form.currentInsurer,

            current_annual_premium:
              form.currentPremium,

            current_deductible:
              form.deductible,

            coverage_type:
              form.coverageType,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw createSafeApiError(
          result.error,
          "Unable to submit your request."
        );
      }

      setSuccess(
        "Your motor insurance request has been submitted successfully."
      );
    } catch (err) {
      setError(
        getSafeApiErrorMessage(
          err,
          "Something went wrong."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      onFocusCapture={trackFormInteraction}
      onChangeCapture={trackFormInteraction}
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily:
          "Arial, Helvetica, sans-serif",
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
          borderBottom:
            "1px solid #e2e8f0",
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
            "linear-gradient(135deg, #082f49 0%, #075985 55%, #0369a1 100%)",
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
              color: "#bae6fd",
              fontSize: "13px",
              fontWeight: 800,
              marginBottom: "14px",
            }}
          >
            MOTOR INSURANCE
          </div>

          <h1
            style={{
              fontSize: "48px",
              lineHeight: 1.1,
              margin: "0 0 18px",
            }}
          >
            Explore cover options for your vehicle.
          </h1>

          <p
            style={{
              maxWidth: "680px",
              color: "#e0f2fe",
              fontSize: "18px",
              lineHeight: 1.6,
            }}
          >
            Enter your vehicle information
            manually or upload your existing
            policy and request a comparison
            from licensed insurance partners.
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
            boxShadow:
              "0 20px 50px rgba(15,23,42,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom:
                "1px solid #e2e8f0",
            }}
          >
            <ModeButton
              active={mode === "manual"}
              onClick={() =>
                setMode("manual")
              }
            >
              🚗 Enter vehicle details
            </ModeButton>

            <ModeButton
              active={mode === "upload"}
              onClick={() =>
                setMode("upload")
              }
            >
              📄 Upload current policy
            </ModeButton>
          </div>

          <div style={{ padding: "38px" }}>
            {mode === "manual" ? (
              <>
                <h2 style={{ marginTop: 0 }}>
                  Tell us about your vehicle
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Enter your vehicle and current
                  insurance information.
                </p>

                <div style={gridStyle}>
                  <Field
                    label="Vehicle make"
                    value={form.make}
                    placeholder="e.g. BMW"
                    onChange={(value) =>
                      updateField("make", value)
                    }
                  />

                  <Field
                    label="Vehicle model"
                    value={form.model}
                    placeholder="e.g. 320d"
                    onChange={(value) =>
                      updateField("model", value)
                    }
                  />

                  <Field
                    label="Year"
                    value={form.year}
                    placeholder="e.g. 2021"
                    onChange={(value) =>
                      updateField("year", value)
                    }
                  />

                  <Field
                    label="Registration country"
                    value={
                      form.registrationCountry
                    }
                    placeholder="e.g. North Macedonia"
                    onChange={(value) =>
                      updateField(
                        "registrationCountry",
                        value
                      )
                    }
                  />

                  <Field
                    label="Fuel type"
                    value={form.fuelType}
                    placeholder="Diesel / Petrol / Electric"
                    onChange={(value) =>
                      updateField(
                        "fuelType",
                        value
                      )
                    }
                  />

                  <Field
                    label="Engine / Power"
                    value={form.enginePower}
                    placeholder="e.g. 140 kW"
                    onChange={(value) =>
                      updateField(
                        "enginePower",
                        value
                      )
                    }
                  />

                  <Field
                    label="Current insurer"
                    value={
                      form.currentInsurer
                    }
                    placeholder="Optional"
                    onChange={(value) =>
                      updateField(
                        "currentInsurer",
                        value
                      )
                    }
                  />

                  <Field
                    label="Current annual premium"
                    value={
                      form.currentPremium
                    }
                    placeholder="e.g. €450"
                    onChange={(value) =>
                      updateField(
                        "currentPremium",
                        value
                      )
                    }
                  />

                  <Field
                    label="Current deductible"
                    value={form.deductible}
                    placeholder="e.g. €300"
                    onChange={(value) =>
                      updateField(
                        "deductible",
                        value
                      )
                    }
                  />

                  <Field
                    label="Coverage type"
                    value={form.coverageType}
                    placeholder="Third party / Comprehensive"
                    onChange={(value) =>
                      updateField(
                        "coverageType",
                        value
                      )
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <h2 style={{ marginTop: 0 }}>
                  Upload your current motor policy
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Upload your existing policy in
                  PDF or image format.
                </p>

                <label
                  style={{
                    display: "block",
                    border:
                      "2px dashed #94a3b8",
                    borderRadius: "16px",
                    padding: "50px 25px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      fontSize: "42px",
                    }}
                  >
                    📄
                  </div>

                  <h3>
                    Select your current policy
                  </h3>

                  <p
                    style={{
                      color: "#64748b",
                    }}
                  >
                    PDF, JPG, JPEG or PNG —
                    maximum 10 MB
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{
                      display: "none",
                    }}
                    onChange={(event) =>
                      handleFile(
                        event.target.files?.[0] ||
                          null
                      )
                    }
                  />
                </label>

                {selectedFile && (
                  <div style={successBox}>
                    ✓ {selectedFile.name}
                  </div>
                )}

                {uploadMessage && (
                  <div style={successBox}>
                    ✓ {uploadMessage}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "18px",
                    background: "#f1f5f9",
                    borderRadius: "12px",
                    padding: "18px",
                    color: "#475569",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  <strong style={{ color: "#0f172a" }}>
                    Your document is intended to be stored privately.
                  </strong>
                  <br />
                  Motor policies may contain personal information. Uploads are
                  used to process and compare your insurance request and are not
                  intended to be publicly accessible. Only upload a document
                  you are authorised to provide.
                </div>

                <button
                  type="button"
                  disabled={
                    !selectedFile || uploading || Boolean(policyPath)
                  }
                  onClick={uploadPolicy}
                  style={{
                    ...primaryButton,
                    background:
                      !selectedFile || uploading || policyPath
                        ? "#cbd5e1"
                        : "#0284c7",
                  }}
                >
                  {uploading
                    ? uploadStage || "Preparing secure upload..."
                    : policyPath
                    ? "Policy uploaded ✓"
                    : "Upload policy"}
                </button>
              </>
            )}

            <Divider />

            <h3>Contact information</h3>

            <div style={gridStyle}>
              <Field
                label="Full name"
                value={form.fullName}
                placeholder="Your full name"
                onChange={(value) =>
                  updateField(
                    "fullName",
                    value
                  )
                }
              />

              <Field
                label="Email address"
                value={form.email}
                placeholder="you@example.com"
                onChange={(value) =>
                  updateField("email", value)
                }
              />

              <Field
                label="Phone number"
                value={form.phone}
                placeholder="+389..."
                onChange={(value) =>
                  updateField("phone", value)
                }
              />

              <SelectField
                label="Preferred contact"
                value={
                  form.preferredContact
                }
                options={[
                  "Email",
                  "Phone",
                  "WhatsApp",
                ]}
                onChange={(value) =>
                  updateField(
                    "preferredContact",
                    value
                  )
                }
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
                border:
                  "1px solid #e2e8f0",
              }}
            >
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) =>
                  setConsent(
                    event.target.checked
                  )
                }
                style={{
                  width: "18px",
                  height: "18px",
                }}
              />

              <span
                style={{
                  color: "#475569",
                  lineHeight: 1.6,
                  fontSize: "14px",
                }}
              >
                I agree that my information may
                be processed for this insurance
                request and shared with relevant
                licensed insurance partners where
                applicable.
              </span>
            </label>

            <div
              style={{
                marginTop: "18px",
                background: "#fffbeb",
                border:
                  "1px solid #fde68a",
                padding: "18px",
                borderRadius: "12px",
                color: "#92400e",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              The Meta Insurance is a technology,
              referral and affiliate platform.
              Insurance offers, underwriting,
              eligibility decisions, regulated
              advice, policy issuance and final
              terms are provided by relevant
              licensed insurance partners.
            </div>

            {error && (
              <div style={errorBox}>
                {error}
              </div>
            )}

            {success && (
              <div style={successBox}>
                ✓ {success}
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={submitLead}
              style={{
                ...primaryButton,
                background: submitting
                  ? "#94a3b8"
                  : "#0284c7",
              }}
            >
              {submitting
                ? "Submitting request..."
                : "Request motor insurance offers →"}
            </button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "24px",
        border: "none",
        cursor: "pointer",
        background: active
          ? "#e0f2fe"
          : "#ffffff",
        fontWeight: 800,
        fontSize: "16px",
      }}
    >
      {children}
    </button>
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
      <div style={labelStyle}>
        {label}
      </div>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={inputStyle}
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
      <div style={labelStyle}>
        {label}
      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={inputStyle}
      >
        <option value="">
          Select an option
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Divider() {
  return (
    <div
      style={{
        margin: "32px 0",
        borderTop:
          "1px solid #e2e8f0",
      }}
    />
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "18px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: 800,
  marginBottom: "7px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  padding: "13px",
  fontSize: "14px",
  outline: "none",
  background: "#ffffff",
};

const primaryButton = {
  width: "100%",
  marginTop: "24px",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  padding: "16px",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
};

const successBox = {
  marginTop: "18px",
  background: "#ecfdf5",
  border: "1px solid #86efac",
  color: "#166534",
  padding: "16px",
  borderRadius: "10px",
  fontWeight: 700,
};

const errorBox = {
  marginTop: "18px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  padding: "16px",
  borderRadius: "10px",
  fontWeight: 700,
};
