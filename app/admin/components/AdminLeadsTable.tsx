"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type {
  AdminLeadListItem,
  AdminPageResult,
} from "../../lib/admin-dashboard-types";
import { LEAD_STATUSES } from "../../lib/lead-status-types";
import { PARTNER_INSURANCE_TYPES } from "../../lib/partner-types";
import {
  formatAdminDate,
  formatAdminLabel,
  StatusBadge,
} from "./AdminUi";

export default function AdminLeadsTable({
  initialResult,
}: {
  initialResult: AdminPageResult<AdminLeadListItem>;
}) {
  const [result, setResult] = useState(initialResult);
  const [insuranceType, setInsuranceType] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function load(page: number) {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/leads/search", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insuranceType, status, search, page }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.success || !body?.result) {
        if (response.status === 401) {
          window.location.assign("/admin/login");
          return;
        }
        setError(body?.error || "Leads could not be loaded.");
        return;
      }
      setResult(body.result);
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(1);
  }

  return (
    <>
      <form className="admin-filter-grid" onSubmit={submit} noValidate>
        <label>
          Insurance type
          <select value={insuranceType} onChange={(event) => setInsuranceType(event.target.value)}>
            <option value="all">All insurance types</option>
            {PARTNER_INSURANCE_TYPES.map((value) => (
              <option key={value} value={value}>{formatAdminLabel(value)}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>{formatAdminLabel(value)}</option>
            ))}
          </select>
        </label>
        <label>
          Name or email
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxLength={100}
            autoComplete="off"
            placeholder="Search protected records"
          />
        </label>
        <button className="admin-button admin-button-primary" type="submit" disabled={pending}>
          {pending ? "Searching…" : "Apply filters"}
        </button>
      </form>

      <p className="admin-privacy-note">
        Name and email searches are sent in a protected request body and are not placed in the URL.
      </p>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}

      <div className="admin-table-wrap" aria-busy={pending}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Created</th><th>Insurance</th><th>Name</th><th>Email</th>
              <th>Preferred contact</th><th>Status</th><th>Policy</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((lead) => (
              <tr key={lead.id}>
                <td>{formatAdminDate(lead.created_at)}</td>
                <td>{formatAdminLabel(lead.insurance_type)}</td>
                <td>{lead.full_name}</td>
                <td>{lead.email ?? "Not provided"}</td>
                <td>{lead.preferred_contact ?? "Not provided"}</td>
                <td><StatusBadge value={lead.status} /></td>
                <td>{lead.policy_document_path ? "Uploaded" : "Not uploaded"}</td>
                <td><Link className="admin-text-link" href={`/admin/leads/${lead.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.items.length === 0 ? <div className="admin-empty">No leads found.</div> : null}
      </div>

      <nav className="admin-pagination" aria-label="Lead pagination">
        <span>Page {result.page} of {result.totalPages} · {result.total} records</span>
        <div>
          <button className="admin-button admin-button-secondary" type="button" disabled={pending || result.page <= 1} onClick={() => void load(result.page - 1)}>Previous</button>
          <button className="admin-button admin-button-secondary" type="button" disabled={pending || result.page >= result.totalPages} onClick={() => void load(result.page + 1)}>Next</button>
        </div>
      </nav>
    </>
  );
}
