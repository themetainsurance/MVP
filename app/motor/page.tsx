"use client";

import { useState } from "react";

export default function MotorInsurancePage() {
  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [fileName, setFileName] = useState("");

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
              maxWidth: "650px",
              color: "#e0f2fe",
              fontSize: "18px",
              lineHeight: 1.6,
            }}
          >
            Enter your vehicle details manually or upload your current policy
            and compare what you gain, what you lose and how the price changes.
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
                fileName={fileName}
                setFileName={setFileName}
              />
            )}
          </div>
        </div>

        {/* EXPLANATION */}
        <div
          style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <InfoCard
            icon="🔍"
            title="Compare your current cover"
            text="We will compare your existing policy against available insurance options."
          />

          <InfoCard
            icon="➕"
            title="See what you gain"
            text="Higher limits, additional coverage, lower deductibles and useful extras."
          />

          <InfoCard
            icon="➖"
            title="See what you lose"
            text="We clearly show any coverage, limits or benefits that are reduced."
          />
        </div>
      </section>
    </main>
  );
}

function ManualMotorForm() {
  return (
    <div>
      <h2 style={{ fontSize: "28px", marginTop: 0 }}>
        Tell us about your vehicle
      </h2>

      <p
        style={{
          color: "#64748b",
          marginBottom: "30px",
        }}
      >
        Enter the basic vehicle and insurance details below.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "18px",
        }}
      >
        <Field label="Vehicle make" placeholder="e.g. BMW" />
        <Field label="Vehicle model" placeholder="e.g. 320d" />

        <Field label="Year" placeholder="e.g. 2021" />
        <Field label="Registration country" placeholder="e.g. Germany" />

        <Field label="Fuel type" placeholder="Petrol / Diesel / Electric" />
        <Field label="Engine / Power" placeholder="e.g. 140 kW" />

        <Field label="Current insurer" placeholder="Optional" />
        <Field label="Current annual premium" placeholder="e.g. €450" />

        <Field label="Current deductible" placeholder="e.g. €300" />
        <Field label="Coverage type" placeholder="Third party / Comprehensive" />
      </div>

      <button
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
        Continue to comparison →
      </button>
    </div>
  );
}

function UploadPolicy({
  fileName,
  setFileName,
}: {
  fileName: string;
  setFileName: (name: string) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "28px", marginTop: 0 }}>
        Upload your current motor policy
      </h2>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.6,
          marginBottom: "28px",
        }}
      >
        Upload your existing policy and we will use it to compare price,
        coverage, limits, deductibles and additional benefits.
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
            color: "#0284c7",
            fontWeight: 700,
          }}
        >
          Click to choose a file
        </div>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              setFileName(file.name);
            }
          }}
        />
      </label>

      {fileName && (
        <div
          style={{
            marginTop: "20px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            padding: "16px",
            borderRadius: "10px",
            color: "#065f46",
            fontWeight: 700,
          }}
        >
          ✓ Selected file: {fileName}
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
          lineHeight: 1.6,
        }}
      >
        Your policy will be analysed for premium, coverage limits,
        deductibles, exclusions and additional benefits. If any information
        cannot be identified reliably, we will ask you to confirm it.
      </div>

      <button
        disabled={!fileName}
        style={{
          width: "100%",
          marginTop: "24px",
          background: fileName ? "#0284c7" : "#cbd5e1",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: 800,
          cursor: fileName ? "pointer" : "not-allowed",
        }}
      >
        Analyze current policy →
      </button>
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
      <div style={{ fontSize: "28px" }}>{icon}</div>

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
