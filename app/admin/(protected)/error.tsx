"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section className="admin-card" role="alert">
      <p className="admin-eyebrow">OPERATIONAL ERROR</p>
      <h1>Dashboard data is temporarily unavailable</h1>
      <p className="admin-page-description">
        No operational changes were made. Try loading this protected page again.
      </p>
      <button className="admin-button admin-button-primary" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
