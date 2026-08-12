"use client";

import { useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export default function MotorInsurancePage() {
  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* HEADER */}
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

      {/* HERO */}
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
            Find better cover for your vehicle.
          </h1>

          <p
            style={{
              maxWidth: "680px",
              color: "#e0f2fe",
              fontSize: "18px",
              lineHeight: 1.6,
            }}
          >
            Enter your vehicle details manually or upload your current policy
            to request a factual comparison of price, coverage and benefits
            from licensed insurance partners.
          </p>
        </div>
      </section>

      {/* MAIN CARD */}
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
          {/* MODE SWITCH */}
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
                background: mode === "manual" ? "#e0f2fe" : "#ffffff",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "16px",
              }}
            >
              🚗 Enter vehicle details
            </button>

            <button
              type="button"
              onClick={() => setMode("upload")}
              style={{
                padding: "24px",
                border: "none",
                cursor: "pointer",
                background: mode === "upload" ? "#e0f2fe" : "#ffffff",
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
              <ManualMotorForm />
            ) : (
              <UploadPolicy
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />
            )}
          </div>
        </div>

        {/* HOW COMPARISON WORKS */}
        <div
          style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "20px",
          }}
        >
          <InfoCard
            icon="🔍"
            title="Compare your current cover"
            text="Your existing policy can be factually compared against offers supplied by licensed insurance partners."
          />

          <InfoCard
            icon="➕"
            title="See what you gain"
            text="Clearly see higher limits, additional coverage, lower deductibles and extra benefits."
          />

          <InfoCard
            icon="➖"
            title="See what changes"
            text="Any reduced cover, exclusions or increased deductibles can be displayed clearly alongside the new offer."
          />
        </div>

        {/* EXAMPLE COMPARISON */}
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
              color: "#0284c7",
              fontSize: "12px",
              fontWeight: 900,
              marginBottom: "10px",
            }}
          >
            HOW YOUR COMPARISON WILL LOOK
          </div>

          <h2
            style={{
              marginTop: 0,
              fontSize: "28px",
            }}
          >
            Current policy vs new offer
          </h2>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.6,
              marginBottom: "28px",
            }}
          >
            The platform is designed to show factual differences clearly,
            rather than hiding them inside complicated policy wording.
          </p>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "650px",
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
                  current="€420"
                  offer="€420"
                  difference="Same price"
                />

                <ComparisonRow
                  name="Glass cover"
                  current="€500"
                  offer="€1,000"
                  difference="+ €500"
                />

                <ComparisonRow
                  name="Roadside assistance"
                  current="Not included"
                  offer="Included"
                  difference="+ Added"
                />

                <ComparisonRow
                  name="Personal accident"
                  current="€10,000"
                  offer="€25,000"
                  difference="+ €15,000"
                />

                <ComparisonRow
                  name="Deductible"
                  current="€300"
                  offer="€200"
                  difference="€100 lower"
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
                + Example improvements
              </strong>

              <ul
                style={{
                  color: "#166534",
                  lineHeight: 1.8,
                  paddingLeft: "20px",
                }}
              >
                <li>Higher glass cover</li>
                <li>Roadside assistance added</li>
                <li>Higher personal accident limit</li>
                <li>Lower deductible</li>
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
                Final terms, eligibility, recommendations and insurance advice
                are provided by the relevant licensed insurance partner.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ManualMotorForm() {
  return (
    <div>
      <h2
        style={{
          fontSize: "28px",
          marginTop: 0,
        }}
      >
        Tell us about your vehicle
      </h2>

      <p
        style={{
          color: "#64748b",
          marginBottom: "30px",
          lineHeight: 1.6,
        }}
      >
        Enter the basic vehicle and insurance information required to request
        offers from licensed insurance partners.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "18px",
        }}
      >
        <Field
          label="Vehicle make"
          placeholder="e.g. BMW"
        />

        <Field
          label="Vehicle model"
          placeholder="e.g. 320d"
        />

        <Field
          label="Year"
          placeholder="e.g. 2021"
        />

        <Field
          label="Registration country"
          placeholder="e.g. North Macedonia"
        />

        <Field
          label="Fuel type"
          placeholder="Petrol / Diesel / Hybrid / Electric"
        />

        <Field
          label="Engine / Power"
          placeholder="e.g. 140 kW"
        />

        <Field
          label="Current insurer"
          placeholder="Optional"
        />

        <Field
          label="Current annual premium"
          placeholder="e.g. €450"
        />

        <Field
          label="Current deductible"
          placeholder="e.g. €300"
        />

        <Field
          label="Coverage type"
          placeholder="Third party / Comprehensive"
        />
      </div>

      <div
        style={{
          marginTop: "25px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "18px",
          color: "#475569",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        The Meta Insurance operates as a technology and referral platform.
        Insurance offers, regulated advice and final policy recommendations
        are provided by licensed insurance partners.
      </div>

      <button
        type="button"
        style={{
          width: "100%",
          marginTop: "28px",
          background: "#0284c7",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Request insurance offers →
      </button>
    </div>
  );
}

function UploadPolicy({
  selectedFile,
  setSelectedFile,
}: {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleFile(file: File | null) {
    setMessage("");
    setError("");

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
      setError("The file is too large. Maximum allowed size is 10 MB.");
      return;
    }

    setSelectedFile(file);
  }

  async function uploadPolicy() {
    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload-policy", {
        method: "POST",
        body: formData,
      });

      let result: {
        success?: boolean;
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

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "The policy could not be uploaded."
        );
      }

      setMessage(
        "Policy uploaded successfully. Your document is ready to be submitted for comparison."
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
      <h2
        style={{
          fontSize: "28px",
          marginTop: 0,
        }}
      >
        Upload your current motor policy
      </h2>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.6,
          marginBottom: "28px",
        }}
      >
        Upload your existing policy and request a factual comparison with
        insurance offers provided by licensed insurance partners.
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
        <div
          style={{
            fontSize: "42px",
            marginBottom: "14px",
          }}
        >
          📄
        </div>

        <div
          style={{
            fontWeight: 800,
            fontSize: "18px",
            marginBottom: "8px",
          }}
        >
          Upload current policy
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
            color: "#0284c7",
            fontWeight: 700,
          }}
        >
          Click to choose a file
        </div>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          style={{
            display: "none",
          }}
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
          <div
            style={{
              fontWeight: 800,
              marginBottom: "5px",
            }}
          >
            ✓ File selected
          </div>

          <div>
            {selectedFile.name}
          </div>

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
        Uploaded policies can contain personal information, so documents are
        sent through our server and stored in private storage rather than
        being exposed through a public file URL.
      </div>

      <div
        style={{
          marginTop: "16px",
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "12px",
          padding: "18px",
          color: "#92400e",
          fontSize: "14px",
          lineHeight: 1.7,
        }}
      >
        The Meta Insurance is a technology and referral platform. Any
        insurance recommendation, final offer or regulated insurance advice is
        provided by the relevant licensed insurance partner.
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
              ? "#0284c7"
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
          ? "Uploading policy..."
          : "Upload & request comparison →"}
      </button>

      {selectedFile && !uploading && (
        <button
          type="button"
          onClick={() => {
            setSelectedFile(null);
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
  placeholder,
}: {
  label: string;
  placeholder: string;
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
        placeholder={placeholder}
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
      <div
        style={{
          fontSize: "28px",
        }}
      >
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
          color: "#0284c7",
          fontWeight: 800,
        }}
      >
        {difference}
      </td>
    </tr>
  );
}
