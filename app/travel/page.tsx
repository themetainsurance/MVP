"use client";

import { useState } from "react";

export default function TravelInsurancePage() {
  const [tripType, setTripType] = useState<"single" | "annual">("single");
  const [travelers, setTravelers] = useState(1);

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
            "linear-gradient(135deg, #172554 0%, #1d4ed8 55%, #2563eb 100%)",
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
            Protect your trip before you travel.
          </h1>

          <p
            style={{
              maxWidth: "700px",
              color: "#dbeafe",
              fontSize: "18px",
              lineHeight: 1.6,
            }}
          >
            Tell us where you are travelling, when you are going and who is
            travelling. We will use your information to request relevant
            insurance offers from licensed insurance partners.
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
            padding: "38px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Tell us about your trip
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "32px",
              lineHeight: 1.6,
            }}
          >
            Enter your travel details to request travel insurance offers.
          </p>

          <div
            style={{
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                marginBottom: "9px",
              }}
            >
              Trip type
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setTripType("single")}
                style={{
                  padding: "15px",
                  borderRadius: "10px",
                  border:
                    tripType === "single"
                      ? "2px solid #2563eb"
                      : "1px solid #cbd5e1",
                  background:
                    tripType === "single"
                      ? "#eff6ff"
                      : "#ffffff",
                  color: "#0f172a",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ✈️ Single trip
              </button>

              <button
                type="button"
                onClick={() => setTripType("annual")}
                style={{
                  padding: "15px",
                  borderRadius: "10px",
                  border:
                    tripType === "annual"
                      ? "2px solid #2563eb"
                      : "1px solid #cbd5e1",
                  background:
                    tripType === "annual"
                      ? "#eff6ff"
                      : "#ffffff",
                  color: "#0f172a",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                🌍 Annual multi-trip
              </button>
            </div>
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
              placeholder="e.g. North Macedonia"
            />

            <Field
              label="Destination"
              placeholder="e.g. Italy"
            />

            <DateField
              label="Departure date"
            />

            <DateField
              label="Return date"
            />

            <SelectField
              label="Purpose of travel"
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
              options={[
                "Europe",
                "Worldwide excluding USA & Canada",
                "Worldwide",
              ]}
            />
          </div>

          <div
            style={{
              marginTop: "30px",
              paddingTop: "28px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                fontSize: "21px",
                marginTop: 0,
              }}
            >
              Travellers
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                marginBottom: "20px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setTravelers((current) =>
                    Math.max(1, current - 1)
                  )
                }
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
                −
              </button>

              <div
                style={{
                  minWidth: "90px",
                  textAlign: "center",
                  fontWeight: 800,
                }}
              >
                {travelers}{" "}
                {travelers === 1 ? "traveller" : "travellers"}
              </div>

              <button
                type="button"
                onClick={() =>
                  setTravelers((current) =>
                    Math.min(10, current + 1)
                  )
                }
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
                +
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              {Array.from({ length: travelers }).map((_, index) => (
                <Field
                  key={index}
                  label={`Traveller ${index + 1} age`}
                  placeholder="e.g. 34"
                />
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: "30px",
              paddingTop: "28px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                fontSize: "21px",
                marginTop: 0,
                marginBottom: "18px",
              }}
            >
              Coverage preferences
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <CheckOption label="Emergency medical expenses" />
              <CheckOption label="Trip cancellation" />
              <CheckOption label="Lost or delayed baggage" />
              <CheckOption label="Flight delay" />
              <CheckOption label="Personal liability" />
              <CheckOption label="Winter sports" />
              <CheckOption label="Adventure sports" />
              <CheckOption label="Rental car excess" />
            </div>
          </div>

          <div
            style={{
              marginTop: "30px",
              paddingTop: "28px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                fontSize: "21px",
                marginTop: 0,
              }}
            >
              Contact information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              <Field
                label="Full name"
                placeholder="Your full name"
              />

              <Field
                label="Email address"
                placeholder="you@example.com"
              />

              <Field
                label="Phone number"
                placeholder="+389..."
              />

              <Field
                label="Preferred contact"
                placeholder="Email / Phone / WhatsApp"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "26px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "18px",
              color: "#475569",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            The Meta Insurance operates as a technology and referral platform.
            Insurance offers, regulated advice and final recommendations are
            provided by licensed insurance partners.
          </div>

          <button
            type="button"
            style={{
              width: "100%",
              marginTop: "26px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "17px",
              fontSize: "16px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Request travel insurance offers →
          </button>
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
            icon="🌍"
            title="Travel worldwide"
            text="Choose European or worldwide travel insurance depending on your destination."
          />

          <InfoCard
            icon="🏥"
            title="Medical protection"
            text="Compare emergency medical expense limits and assistance benefits."
          />

          <InfoCard
            icon="🧳"
            title="Trip protection"
            text="Compare cancellation, baggage, delay and other available travel benefits."
          />
        </div>
      </section>
    </main>
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

function DateField({
  label,
}: {
  label: string;
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
        type="date"
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
      />
    </label>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
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
        <option value="">
          Select an option
        </option>

        {options.map((option) => (
          <option
            value={option}
            key={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckOption({
  label,
}: {
  label: string;
}) {
  return (
    <label
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
        style={{
          width: "18px",
          height: "18px",
        }}
      />

      <span
        style={{
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
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
