"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import BrandLogo from "../components/BrandLogo";
import PremiumInsuranceIcon from "../components/PremiumInsuranceIcon";
import SiteFooter from "../components/SiteFooter";
import { useAnalytics } from "../components/AnalyticsProvider";
import {
  createSafeApiError,
  getSafeApiErrorMessage,
} from "../lib/safe-api-error";

type FormData = {
  countryOfResidence: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  purpose: string;
  coverageArea: string;
  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
};

const QUICK_START_DESTINATION_MAX_LENGTH = 120;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function readQuickStartDestination(params: URLSearchParams) {
  const value = (params.get("destination") ?? "").trim();

  if (/[\u0000-\u001f\u007f]/.test(value)) {
    return "";
  }

  return value.slice(0, QUICK_START_DESTINATION_MAX_LENGTH);
}

function readQuickStartDate(
  params: URLSearchParams,
  name: "departureDate" | "returnDate"
) {
  const value = params.get(name) ?? "";

  if (!ISO_DATE_PATTERN.test(value)) {
    return "";
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : "";
}

export default function TravelInsurancePage() {
  const { getAnalyticsSessionId, trackFormStarted } = useAnalytics();
  const [tripType, setTripType] = useState<"single" | "annual">("single");
  const [travelers, setTravelers] = useState(1);
  const [ages, setAges] = useState<string[]>([""]);

  const [coverage, setCoverage] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    countryOfResidence: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    purpose: "",
    coverageArea: "",
    fullName: "",
    email: "",
    phone: "",
    preferredContact: "",
  });

  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const destination = readQuickStartDestination(params);
    const departureDate = readQuickStartDate(params, "departureDate");
    const returnDate = readQuickStartDate(params, "returnDate");

    if (!destination && !departureDate && !returnDate) {
      return;
    }

    setFormData((current) => ({
      ...current,
      ...(destination ? { destination } : {}),
      ...(departureDate ? { departureDate } : {}),
      ...(returnDate ? { returnDate } : {}),
    }));
  }, []);

  function trackFormInteraction(event: SyntheticEvent) {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      trackFormStarted({ insuranceType: "travel", formMode: "manual" });
    }
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeTravelers(amount: number) {
    const next = Math.min(10, Math.max(1, travelers + amount));

    setTravelers(next);

    setAges((current) => {
      const copy = [...current];

      while (copy.length < next) {
        copy.push("");
      }

      return copy.slice(0, next);
    });
  }

  function updateAge(index: number, value: string) {
    setAges((current) => {
      const copy = [...current];
      copy[index] = value;
      return copy;
    });
  }

  function toggleCoverage(item: string) {
    setCoverage((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  }

  async function submitLead() {
    setError("");
    setSuccess("");

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setError("Please enter an email address or phone number.");
      return;
    }

    if (!formData.destination.trim()) {
      setError("Please enter your destination.");
      return;
    }

    if (!consent) {
      setError(
        "Please confirm that you agree to your information being used to process your insurance request."
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
          insurance_type: "travel",
          analytics_session_id: getAnalyticsSessionId() ?? undefined,

          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          preferred_contact: formData.preferredContact,

          consent: true,

          details: {
            trip_type: tripType,
            country_of_residence: formData.countryOfResidence,
            destination: formData.destination,
            departure_date: formData.departureDate,
            return_date: formData.returnDate,
            purpose_of_travel: formData.purpose,
            coverage_area: formData.coverageArea,
            travelers,
            traveler_ages: ages,
            requested_coverage: coverage,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw createSafeApiError(
          result.error,
          "Unable to submit your insurance request."
        );
      }

      setSuccess(
        "Your travel insurance request has been submitted successfully."
      );
    } catch (err) {
      setError(
        getSafeApiErrorMessage(
          err,
          "Something went wrong. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="tmi-page"
      onFocusCapture={trackFormInteraction}
      onChangeCapture={trackFormInteraction}
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <header
        className="tmi-site-header"
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
          <BrandLogo />
        </a>

        <a
          href="/"
          style={{
            textDecoration: "none",
            color: "#2563eb",
            fontWeight: 700,
          }}
        >
          ← Back to home
        </a>
      </header>

      <section
        className="tmi-category-hero"
        style={{
          background:
            "linear-gradient(135deg, #172554 0%, #1d4ed8 55%, #2563eb 100%)",
          color: "#ffffff",
          padding: "65px 7% 120px",
        }}
      >
        <div
          className="tmi-category-hero-inner"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <div className="tmi-category-hero-copy">
            <div
              style={{
                color: "#bfdbfe",
                fontSize: "13px",
                fontWeight: 800,
                marginBottom: "14px",
              }}
            >
              TRAVEL INSURANCE
            </div>

            <h1
              style={{
                fontSize: "48px",
                lineHeight: 1.1,
                margin: "0 0 18px",
              }}
            >
              Explore travel insurance options.
            </h1>

            <p
              style={{
                maxWidth: "700px",
                color: "#dbeafe",
                fontSize: "18px",
                lineHeight: 1.6,
              }}
            >
              Enter your travel details to request insurance options from
              relevant licensed insurance providers or partners.
            </p>
          </div>
          <div className="tmi-category-visual" aria-hidden="true">
            <span className="tmi-icon-orbit" />
            <div className="tmi-category-icon-shell">
              <PremiumInsuranceIcon kind="travel" className="tmi-category-icon" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="tmi-overlap-section"
        style={{
          maxWidth: "1100px",
          margin: "-70px auto 0",
          padding: "0 24px 90px",
        }}
      >
        <div
          className="tmi-surface"
          style={{
            background: "#ffffff",
            borderRadius: "22px",
            boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
            padding: "38px",
          }}
        >
          <h2 style={{ fontSize: "28px", marginTop: 0 }}>
            Tell us about your trip
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "32px",
            }}
          >
            Enter your travel details to request insurance options.
          </p>

          <SectionTitle>Trip type</SectionTitle>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            <ChoiceButton
              active={tripType === "single"}
              onClick={() => setTripType("single")}
            >
              <PremiumInsuranceIcon kind="travel" className="tmi-inline-icon" /> Single trip
            </ChoiceButton>

            <ChoiceButton
              active={tripType === "annual"}
              onClick={() => setTripType("annual")}
            >
              🌍 Annual multi-trip
            </ChoiceButton>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <Field
              label="Country of residence"
              value={formData.countryOfResidence}
              placeholder="e.g. North Macedonia"
              onChange={(value) =>
                updateField("countryOfResidence", value)
              }
            />

            <Field
              label="Destination"
              value={formData.destination}
              placeholder="e.g. Italy"
              onChange={(value) => updateField("destination", value)}
            />

            <DateField
              label="Departure date"
              value={formData.departureDate}
              onChange={(value) => updateField("departureDate", value)}
            />

            <DateField
              label="Return date"
              value={formData.returnDate}
              onChange={(value) => updateField("returnDate", value)}
            />

            <SelectField
              label="Purpose of travel"
              value={formData.purpose}
              onChange={(value) => updateField("purpose", value)}
              options={[
                "Holiday",
                "Business",
                "Study",
                "Family visit",
                "Sports",
                "Other",
              ]}
            />

            <SelectField
              label="Coverage area"
              value={formData.coverageArea}
              onChange={(value) => updateField("coverageArea", value)}
              options={[
                "Europe",
                "Worldwide excluding USA & Canada",
                "Worldwide",
              ]}
            />
          </div>

          <Divider />

          <h3>Travellers</h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              marginBottom: "22px",
            }}
          >
            <CounterButton onClick={() => changeTravelers(-1)}>
              −
            </CounterButton>

            <strong>
              {travelers} {travelers === 1 ? "traveller" : "travellers"}
            </strong>

            <CounterButton onClick={() => changeTravelers(1)}>
              +
            </CounterButton>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            {ages.map((age, index) => (
              <Field
                key={index}
                label={`Traveller ${index + 1} age`}
                value={age}
                placeholder="e.g. 34"
                onChange={(value) => updateAge(index, value)}
              />
            ))}
          </div>

          <Divider />

          <h3>Coverage preferences</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {[
              "Emergency medical expenses",
              "Trip cancellation",
              "Lost or delayed baggage",
              "Flight delay",
              "Personal liability",
              "Winter sports",
              "Adventure sports",
              "Rental car excess",
            ].map((item) => (
              <label
                className="tmi-choice"
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "1px solid #e2e8f0",
                  padding: "14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={coverage.includes(item)}
                  onChange={() => toggleCoverage(item)}
                />

                <span style={{ fontWeight: 700, fontSize: "14px" }}>
                  {item}
                </span>
              </label>
            ))}
          </div>

          <Divider />

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
              value={formData.fullName}
              placeholder="Your full name"
              onChange={(value) => updateField("fullName", value)}
            />

            <Field
              label="Email address"
              value={formData.email}
              placeholder="you@example.com"
              onChange={(value) => updateField("email", value)}
            />

            <Field
              label="Phone number"
              value={formData.phone}
              placeholder="+389..."
              onChange={(value) => updateField("phone", value)}
            />

            <SelectField
              label="Preferred contact"
              value={formData.preferredContact}
              onChange={(value) =>
                updateField("preferredContact", value)
              }
              options={["Email", "Phone", "WhatsApp"]}
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
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              style={{
                marginTop: "3px",
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
              I agree that my information may be processed for the purpose of
              handling this insurance request and, where applicable, shared
              with relevant licensed insurance partners.
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
            The Meta Insurance is an independent insurance discovery and
            referral platform. We do not underwrite, bind, issue or sell
            insurance, determine eligibility or pricing, or provide regulated
            insurance advice. Relevant licensed insurance partners determine
            final terms and coverage availability.
          </div>

          {error && (
            <div
              style={{
                marginTop: "20px",
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
                marginTop: "20px",
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
            className="tmi-primary-button"
            type="button"
            disabled={submitting}
            onClick={submitLead}
            style={{
              width: "100%",
              marginTop: "26px",
              background: submitting ? "#94a3b8" : "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "17px",
              fontSize: "16px",
              fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting
              ? "Submitting request..."
              : "Request travel insurance options →"}
          </button>
        </div>
      </section>
      <SiteFooter />
    </main>
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
      <SectionTitle>{label}</SectionTitle>

      <input
        className="tmi-input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <SectionTitle>{label}</SectionTitle>

      <input
        className="tmi-input"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
      <SectionTitle>{label}</SectionTitle>

      <select
        className="tmi-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
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

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: "13px",
        fontWeight: 800,
        marginBottom: "7px",
      }}
    >
      {children}
    </div>
  );
}

function ChoiceButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="tmi-interactive"
      type="button"
      onClick={onClick}
      style={{
        padding: "15px",
        borderRadius: "10px",
        border: active
          ? "2px solid #2563eb"
          : "1px solid #cbd5e1",
        background: active ? "#eff6ff" : "#ffffff",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function CounterButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="tmi-interactive"
      type="button"
      onClick={onClick}
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        fontSize: "20px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        margin: "30px 0",
        borderTop: "1px solid #e2e8f0",
      }}
    />
  );
}

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
