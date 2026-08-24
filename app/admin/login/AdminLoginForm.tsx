"use client";

import { useState, type CSSProperties, type FormEvent } from "react";

const GENERIC_AUTH_ERROR =
  "Invalid credentials or access is not authorized.";
const INVALID_INPUT_ERROR = "Enter a valid email address and password.";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const normalizedEmail = typeof email === "string" ? email.trim() : "";

    if (
      normalizedEmail.length === 0 ||
      normalizedEmail.length > 320 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      typeof password !== "string" ||
      password.length === 0 ||
      password.length > 1024
    ) {
      setError(INVALID_INPUT_ERROR);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (response.ok) {
        window.location.assign("/admin");
        return;
      }

      const body: unknown = await response.json().catch(() => null);
      const message =
        body &&
        typeof body === "object" &&
        typeof Reflect.get(body, "error") === "string"
          ? Reflect.get(body, "error")
          : GENERIC_AUTH_ERROR;

      setError(message);
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle} noValidate>
      <label style={labelStyle}>
        Email
        <input
          name="email"
          type="email"
          required
          maxLength={320}
          autoComplete="email"
          inputMode="email"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Password
        <input
          name="password"
          type="password"
          required
          maxLength={1024}
          autoComplete="current-password"
          style={inputStyle}
        />
      </label>

      {error ? (
        <div role="alert" aria-live="polite" style={errorStyle}>
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={isSubmitting} style={buttonStyle}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

const formStyle: CSSProperties = {
  display: "grid",
  gap: "19px",
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: 800,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: "48px",
  padding: "0 14px",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#0f172a",
  font: "inherit",
  fontWeight: 500,
};

const errorStyle: CSSProperties = {
  padding: "13px 14px",
  border: "1px solid #fecaca",
  borderRadius: "9px",
  background: "#fef2f2",
  color: "#991b1b",
  fontSize: "13px",
  lineHeight: 1.55,
};

const buttonStyle: CSSProperties = {
  minHeight: "50px",
  border: 0,
  borderRadius: "9px",
  background: "#0f172a",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: 800,
};
