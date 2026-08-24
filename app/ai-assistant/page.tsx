"use client";

import { useRef, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import { useAnalytics } from "../components/AnalyticsProvider";
import {
  createSafeApiError,
  getSafeApiErrorMessage,
} from "../lib/safe-api-error";

type InsuranceType = "travel" | "motor" | "property" | null;

type Message = {
  sender: "user" | "assistant";
  text: string;
};

type Answers = {
  destination?: string;
  travelDates?: string;
  travelers?: string;

  vehicleMakeModel?: string;
  vehicleYear?: string;

  propertyType?: string;
  propertyLocation?: string;
  propertyValue?: string;

  fullName?: string;
  email?: string;
  phone?: string;
};

export default function AIAssistantPage() {
  const { getAnalyticsSessionId, trackFormStarted } = useAnalytics();
  const hasTrackedFormStart = useRef(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text:
        "Hi! I can help collect the information needed for an insurance request. Tell me what you want to insure: a trip, a vehicle, or a property.",
    },
  ]);

  const [input, setInput] = useState("");
  const [insuranceType, setInsuranceType] =
    useState<InsuranceType>(null);

  const [step, setStep] = useState(0);

  const [answers, setAnswers] =
    useState<Answers>({});

  const [consent, setConsent] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  function trackAssistantStart(type: InsuranceType) {
    if (hasTrackedFormStart.current) return;
    hasTrackedFormStart.current = true;
    trackFormStarted({
      insuranceType: type,
      formMode: "ai_assistant",
    });
  }

  function addAssistantMessage(text: string) {
    setMessages((current) => [
      ...current,
      {
        sender: "assistant",
        text,
      },
    ]);
  }

  function detectInsuranceType(
    text: string
  ): InsuranceType {
    const value = text.toLowerCase();

    if (
      value.includes("travel") ||
      value.includes("trip") ||
      value.includes("holiday") ||
      value.includes("flight") ||
      value.includes("патување") ||
      value.includes("патничко")
    ) {
      return "travel";
    }

    if (
      value.includes("car") ||
      value.includes("vehicle") ||
      value.includes("motor") ||
      value.includes("auto") ||
      value.includes("bmw") ||
      value.includes("mercedes") ||
      value.includes("авто") ||
      value.includes("кола") ||
      value.includes("возило")
    ) {
      return "motor";
    }

    if (
      value.includes("property") ||
      value.includes("home") ||
      value.includes("house") ||
      value.includes("apartment") ||
      value.includes("property") ||
      value.includes("куќа") ||
      value.includes("стан") ||
      value.includes("имот")
    ) {
      return "property";
    }

    return null;
  }

  function startFlow(type: Exclude<InsuranceType, null>) {
    trackAssistantStart(type);
    setInsuranceType(type);
    setStep(1);

    if (type === "travel") {
      addAssistantMessage(
        "Great. Where are you travelling?"
      );
    }

    if (type === "motor") {
      addAssistantMessage(
        "Great. What is the make and model of your vehicle?"
      );
    }

    if (type === "property") {
      addAssistantMessage(
        "Great. What type of property would you like to insure? For example: apartment, house or commercial property."
      );
    }
  }

  function processAnswer(
    text: string
  ) {
    if (!insuranceType) {
      const detected =
        detectInsuranceType(text);

      if (!detected) {
        addAssistantMessage(
          "I couldn't determine the insurance type. Please tell me whether you need Travel, Motor or Property insurance."
        );
        return;
      }

      startFlow(detected);
      return;
    }

    if (insuranceType === "travel") {
      processTravel(text);
      return;
    }

    if (insuranceType === "motor") {
      processMotor(text);
      return;
    }

    if (insuranceType === "property") {
      processProperty(text);
    }
  }

  function processTravel(text: string) {
    if (step === 1) {
      setAnswers((current) => ({
        ...current,
        destination: text,
      }));

      setStep(2);

      addAssistantMessage(
        "What are your planned travel dates?"
      );

      return;
    }

    if (step === 2) {
      setAnswers((current) => ({
        ...current,
        travelDates: text,
      }));

      setStep(3);

      addAssistantMessage(
        "How many people will be travelling?"
      );

      return;
    }

    if (step === 3) {
      setAnswers((current) => ({
        ...current,
        travelers: text,
      }));

      askForName();
      return;
    }

    processContactSteps(text);
  }

  function processMotor(text: string) {
    if (step === 1) {
      setAnswers((current) => ({
        ...current,
        vehicleMakeModel: text,
      }));

      setStep(2);

      addAssistantMessage(
        "What year was the vehicle manufactured?"
      );

      return;
    }

    if (step === 2) {
      setAnswers((current) => ({
        ...current,
        vehicleYear: text,
      }));

      askForName();

      return;
    }

    processContactSteps(text);
  }

  function processProperty(text: string) {
    if (step === 1) {
      setAnswers((current) => ({
        ...current,
        propertyType: text,
      }));

      setStep(2);

      addAssistantMessage(
        "Where is the property located? Please enter the city and country."
      );

      return;
    }

    if (step === 2) {
      setAnswers((current) => ({
        ...current,
        propertyLocation: text,
      }));

      setStep(3);

      addAssistantMessage(
        "What is the approximate value of the property?"
      );

      return;
    }

    if (step === 3) {
      setAnswers((current) => ({
        ...current,
        propertyValue: text,
      }));

      askForName();

      return;
    }

    processContactSteps(text);
  }

  function askForName() {
    setStep(10);

    addAssistantMessage(
      "Thanks. What is your full name?"
    );
  }

  function processContactSteps(
    text: string
  ) {
    if (step === 10) {
      setAnswers((current) => ({
        ...current,
        fullName: text,
      }));

      setStep(11);

      addAssistantMessage(
        "What is your email address?"
      );

      return;
    }

    if (step === 11) {
      setAnswers((current) => ({
        ...current,
        email: text,
      }));

      setStep(12);

      addAssistantMessage(
        "What is your phone number? If you prefer not to provide one, type Skip."
      );

      return;
    }

    if (step === 12) {
      setAnswers((current) => ({
        ...current,
        phone:
          text.toLowerCase() === "skip"
            ? ""
            : text,
      }));

      setStep(20);

      addAssistantMessage(
        "Your request is ready. Please review the consent box below and then submit your insurance request."
      );
    }
  }

  function sendMessage() {
    const text = input.trim();

    if (!text || completed) {
      return;
    }

    trackAssistantStart(insuranceType);

    setMessages((current) => [
      ...current,
      {
        sender: "user",
        text,
      },
    ]);

    setInput("");

    setTimeout(() => {
      processAnswer(text);
    }, 100);
  }

  async function submitLead() {
    if (!insuranceType) {
      return;
    }

    if (!answers.fullName || !answers.email) {
      addAssistantMessage(
        "Please complete the conversation before submitting."
      );
      return;
    }

    if (!consent) {
      addAssistantMessage(
        "Please confirm the consent checkbox before submitting your request."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/leads",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            insurance_type:
              insuranceType,

            analytics_session_id:
              getAnalyticsSessionId() ?? undefined,

            full_name:
              answers.fullName,

            email:
              answers.email,

            phone:
              answers.phone || "",

            preferred_contact:
              "Email",

            consent: true,

            policy_document_path:
              null,

            details: {
              request_method:
                "ai_assistant_lite",

              ...answers,
            },
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw createSafeApiError(
          result.error,
          "Unable to submit request."
        );
      }

      setCompleted(true);

      addAssistantMessage(
        "✓ Your insurance request has been submitted successfully. A relevant licensed insurance partner may continue the process where applicable."
      );
    } catch (error) {
      addAssistantMessage(
        getSafeApiErrorMessage(
          error,
          "Something went wrong while submitting your request."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetChat() {
    setMessages([
      {
        sender: "assistant",
        text:
          "Hi! Tell me what you want to insure: a trip, a vehicle, or a property.",
      },
    ]);

    setInsuranceType(null);
    setAnswers({});
    setStep(0);
    setConsent(false);
    setCompleted(false);
    setInput("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#0f172a",
      }}
    >
      <header
        style={{
          height: "72px",
          padding: "0 7%",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
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
            fontWeight: 800,
            fontSize: "22px",
          }}
        >
          The Meta Insurance
        </a>

        <a
          href="/"
          style={{
            textDecoration: "none",
            color: "#0284c7",
            fontWeight: 700,
          }}
        >
          ← Back to home
        </a>
      </header>

      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "60px 20px 90px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              color: "#0284c7",
              fontWeight: 900,
              fontSize: "13px",
              marginBottom: "10px",
            }}
          >
            AI ASSISTANT LITE
          </div>

          <h1
            style={{
              fontSize: "42px",
              margin:
                "0 0 12px",
            }}
          >
            Tell us what you need to insure
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "17px",
              lineHeight: 1.6,
            }}
          >
            Answer a few simple questions and
            we'll collect the information
            required for your insurance
            request.
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow:
              "0 15px 45px rgba(15,23,42,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom:
                "1px solid #e2e8f0",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>
                Meta Insurance Assistant
              </strong>

              <div
                style={{
                  color: "#16a34a",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                ● Online
              </div>
            </div>

            <button
              type="button"
              onClick={resetChat}
              style={{
                background: "transparent",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              New conversation
            </button>
          </div>

          <div
            style={{
              minHeight: "420px",
              maxHeight: "520px",
              overflowY: "auto",
              padding: "25px",
              background: "#f8fafc",
            }}
          >
            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      message.sender ===
                      "user"
                        ? "flex-end"
                        : "flex-start",

                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      background:
                        message.sender ===
                        "user"
                          ? "#0284c7"
                          : "#ffffff",

                      color:
                        message.sender ===
                        "user"
                          ? "#ffffff"
                          : "#0f172a",

                      padding:
                        "13px 16px",

                      borderRadius:
                        message.sender ===
                        "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",

                      boxShadow:
                        "0 2px 8px rgba(15,23,42,0.06)",

                      lineHeight: 1.6,
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              )
            )}
          </div>

          {!insuranceType &&
            !completed && (
              <div
                style={{
                  padding:
                    "15px 24px 0",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <QuickButton
                  onClick={() =>
                    startFlow(
                      "travel"
                    )
                  }
                >
                  ✈️ Travel
                </QuickButton>

                <QuickButton
                  onClick={() =>
                    startFlow(
                      "motor"
                    )
                  }
                >
                  🚗 Motor
                </QuickButton>

                <QuickButton
                  onClick={() =>
                    startFlow(
                      "property"
                    )
                  }
                >
                  🏠 Property
                </QuickButton>
              </div>
            )}

          {!completed && step !== 20 && (
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                gap: "10px",
              }}
            >
              <input
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    sendMessage();
                  }
                }}
                placeholder="Type your answer..."
                style={{
                  flex: 1,
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "15px",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={sendMessage}
                style={{
                  border: "none",
                  background: "#0284c7",
                  color: "white",
                  padding: "0 22px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          )}

          {step === 20 &&
            !completed && (
              <div
                style={{
                  padding: "20px 24px 28px",
                }}
              >
                {insuranceType ===
                  "motor" && (
                  <a
                    href="/motor"
                    style={{
                      display: "block",
                      marginBottom:
                        "16px",
                      color:
                        "#0284c7",
                      fontWeight: 700,
                    }}
                  >
                    Have an existing motor
                    policy? You can upload it
                    here →
                  </a>
                )}

                {insuranceType ===
                  "property" && (
                  <a
                    href="/property"
                    style={{
                      display: "block",
                      marginBottom:
                        "16px",
                      color:
                        "#0284c7",
                      fontWeight: 700,
                    }}
                  >
                    Have an existing property
                    policy? You can upload it
                    here →
                  </a>
                )}

                <label
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems:
                      "flex-start",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "15px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(
                      event
                    ) =>
                      setConsent(
                        event.target
                          .checked
                      )
                    }
                  />

                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.6,
                      color: "#475569",
                    }}
                  >
                    I agree that my
                    information may be
                    processed for this
                    insurance request and
                    shared with relevant
                    licensed insurance
                    partners where
                    applicable.
                  </span>
                </label>

                <button
                  type="button"
                  disabled={
                    !consent ||
                    submitting
                  }
                  onClick={submitLead}
                  style={{
                    width: "100%",
                    marginTop: "15px",
                    border: "none",
                    borderRadius: "10px",
                    padding: "15px",
                    background:
                      consent &&
                      !submitting
                        ? "#16a34a"
                        : "#94a3b8",

                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 800,
                    cursor:
                      consent &&
                      !submitting
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit insurance request →"}
                </button>
              </div>
            )}

          <div
            style={{
              margin:
                "0 24px 24px",
              padding: "15px",
              background: "#fffbeb",
              border:
                "1px solid #fde68a",
              borderRadius: "10px",
              color: "#92400e",
              fontSize: "12px",
              lineHeight: 1.6,
            }}
          >
            The Meta Insurance is a
            technology, referral and
            affiliate platform. This
            assistant collects information
            for insurance requests. It does
            not provide regulated insurance
            advice or make final insurance
            recommendations. Final insurance
            offers and advice are provided
            by relevant licensed insurance
            partners.
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function QuickButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "#e0f2fe",
        color: "#075985",
        border: "none",
        borderRadius: "20px",
        padding: "9px 14px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
