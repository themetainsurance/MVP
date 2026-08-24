import Link from "next/link";
import type { ReactNode } from "react";

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date) + " UTC";
}

export function formatAdminLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCommission(
  amount: string | number | null,
  currency: string | null
) {
  if (amount === null || !currency) return "Not reported";
  const numeric = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(numeric)) return `${currency} ${String(amount)}`;
  return `${currency} ${numeric.toFixed(2)}`;
}

export function safeAdminWebsiteUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function embeddedOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="admin-page-description">{description}</p>
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const tone = ["completed", "accepted", "confirmed", "paid", "active"].includes(
    value
  )
    ? "success"
    : ["rejected", "failed", "reversed", "disabled", "inactive"].includes(
          value
        )
      ? "danger"
      : ["pending", "reviewing", "sent", "sent_to_partner", "approved"].includes(
            value
          )
        ? "warning"
        : "neutral";
  return (
    <span className={`admin-badge admin-badge-${tone}`}>
      {formatAdminLabel(value)}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="admin-empty">{children}</div>;
}

export function AdminPagination({
  page,
  totalPages,
  total,
  pathname,
  query,
}: {
  page: number;
  totalPages: number;
  total: number;
  pathname: string;
  query?: Record<string, string | null | undefined>;
}) {
  function href(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const serialized = params.toString();
    return serialized ? `${pathname}?${serialized}` : pathname;
  }

  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <span>
        Page {page} of {totalPages} · {total} records
      </span>
      <div>
        {page > 1 ? (
          <Link className="admin-button admin-button-secondary" href={href(page - 1)}>
            Previous
          </Link>
        ) : (
          <span className="admin-button admin-button-disabled">Previous</span>
        )}
        {page < totalPages ? (
          <Link className="admin-button admin-button-secondary" href={href(page + 1)}>
            Next
          </Link>
        ) : (
          <span className="admin-button admin-button-disabled">Next</span>
        )}
      </div>
    </nav>
  );
}

export function JsonDetails({ value }: { value: unknown }) {
  return <div className="admin-json-tree">{renderJsonValue(value, 0)}</div>;
}

function renderJsonValue(value: unknown, depth: number): ReactNode {
  if (value === null) return <span className="admin-muted">Not provided</span>;
  if (["string", "number", "boolean"].includes(typeof value)) {
    return <span>{String(value)}</span>;
  }
  if (depth >= 5) {
    return <span className="admin-muted">Additional nested details</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="admin-muted">None</span>;
    return (
      <ol className="admin-json-list">
        {value.slice(0, 100).map((item, index) => (
          <li key={index}>{renderJsonValue(item, depth + 1)}</li>
        ))}
      </ol>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, 100);
    if (entries.length === 0) return <span className="admin-muted">None</span>;
    return (
      <dl className="admin-json-object">
        {entries.map(([key, item]) => (
          <div key={key}>
            <dt>{formatAdminLabel(key)}</dt>
            <dd>{renderJsonValue(item, depth + 1)}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return <span className="admin-muted">Unsupported detail</span>;
}
