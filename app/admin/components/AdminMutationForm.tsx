"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type JsonResponse = {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
};

export default function AdminMutationForm({
  endpoint,
  method = "POST",
  submitLabel,
  pendingLabel = "Saving…",
  successMessage = "Saved.",
  confirmMessage,
  className = "admin-form",
  children,
  redirectResultField,
  redirectBase,
}: {
  endpoint: string;
  method?: "POST" | "PATCH";
  submitLabel: string;
  pendingLabel?: string;
  successMessage?: string;
  confirmMessage?: string;
  className?: string;
  children?: ReactNode;
  redirectResultField?: string;
  redirectBase?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setPending(true);
    setMessage("");
    setError("");

    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json().catch(() => null)) as JsonResponse | null;
      if (!response.ok || !result?.success) {
        if (response.status === 401) {
          window.location.assign("/admin/login");
          return;
        }
        setError(result?.error || "Operation could not be completed.");
        return;
      }

      if (redirectResultField && redirectBase) {
        const identifier = result[redirectResultField];
        if (typeof identifier === "string" && /^[0-9a-f-]{36}$/i.test(identifier)) {
          window.location.assign(`${redirectBase}${identifier}`);
          return;
        }
      }

      form.reset();
      setMessage(successMessage);
      router.refresh();
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={className} onSubmit={submit} noValidate>
      {children}
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      {message ? (
        <p className="admin-form-success" role="status">{message}</p>
      ) : null}
      <button className="admin-button admin-button-primary" type="submit" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
