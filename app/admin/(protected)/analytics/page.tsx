import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, EmptyState, formatAdminDate, formatAdminLabel } from "../../components/AdminUi";
import { requireAdmin } from "../../../lib/admin-auth";
import { loadAdminAnalytics } from "../../../lib/analytics-admin-data";
import {
  ANALYTICS_DATE_RANGES,
  formatAnalyticsRate,
  normalizeAnalyticsRange,
} from "../../../lib/analytics-types";

export const metadata: Metadata = {
  title: "Funnel analytics",
  description: "Protected first-party acquisition and operational funnel analytics.",
};

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const range = normalizeAnalyticsRange(query.range);
  const data = await loadAdminAnalytics(range);
  const summary = data.summary;

  const cards = [
    ["Sessions", summary.sessions],
    ["Page views", summary.pageViews],
    ["Sessions with form start", summary.sessionsWithFormStart],
    ["Form starts", summary.formStarts],
    ["Leads", summary.leads],
    ["Handed-off leads", summary.handedOffLeads],
    ["Confirmed conversions", summary.confirmedConversionLeads],
    ["Paid commission leads", summary.paidCommissionLeads],
  ] as const;

  const funnel = [
    {
      label: "Sessions",
      value: summary.sessions,
      rate: null,
    },
    {
      label: "Sessions with form start",
      value: summary.sessionsWithFormStart,
      rate: formatAnalyticsRate(summary.sessionsWithFormStart, summary.sessions),
    },
    {
      label: "Leads",
      value: summary.leads,
      rate: formatAnalyticsRate(summary.leads, summary.sessionsWithFormStart),
    },
    {
      label: "Handoff sent",
      value: summary.handedOffLeads,
      rate: formatAnalyticsRate(summary.handedOffLeads, summary.leads),
    },
    {
      label: "Confirmed conversion",
      value: summary.confirmedConversionLeads,
      rate: formatAnalyticsRate(summary.confirmedConversionLeads, summary.leads),
    },
    {
      label: "Paid commission",
      value: summary.paidCommissionLeads,
      rate: formatAnalyticsRate(
        summary.paidCommissionLeads,
        summary.confirmedConversionLeads
      ),
    },
  ] as const;

  return (
    <>
      <AdminPageHeader
        eyebrow="FIRST-PARTY ANALYTICS"
        title="Analytics"
        description="Privacy-conscious acquisition and operational funnel reporting. Sessions are ephemeral browser sessions, not unique people."
        actions={
          <nav className="admin-range-nav" aria-label="Analytics date range">
            {ANALYTICS_DATE_RANGES.map((value) => (
              <Link
                className={`admin-button ${value === range ? "admin-button-primary" : "admin-button-secondary"}`}
                href={`/admin/analytics?range=${value}`}
                key={value}
                aria-current={value === range ? "page" : undefined}
              >
                {value} days
              </Link>
            ))}
          </nav>
        }
      />

      <p className="admin-privacy-note">
        Last {range} days, from {formatAdminDate(data.startAt)} to {formatAdminDate(data.endAt)}. Date boundaries use UTC.
      </p>

      {!data.available ? (
        <section className="admin-card" aria-labelledby="analytics-unavailable-title">
          <h2 id="analytics-unavailable-title">Analytics database setup is not available yet.</h2>
          <p className="admin-help">
            Apply the reviewed first-party analytics migration before relying on this dashboard. Existing public and admin operations remain available.
          </p>
        </section>
      ) : (
        <>
          <section aria-labelledby="analytics-summary-title">
            <div className="admin-section-heading">
              <h2 id="analytics-summary-title">Summary</h2>
            </div>
            <div className="admin-grid admin-grid-4">
              {cards.map(([label, value]) => (
                <div className="admin-stat-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-section admin-split" aria-label="Operational funnel and commission totals">
            <article className="admin-card">
              <h2>Operational funnel</h2>
              <p className="admin-help">
                Business stages count unique leads from this period. One lead is counted once even when it has multiple handoffs or conversion records.
              </p>
              <ol className="admin-funnel">
                {funnel.map((stage) => (
                  <li key={stage.label}>
                    <span>{stage.label}</span>
                    <strong>{stage.value}</strong>
                    <small>{stage.rate ? `${stage.rate} from the preceding basis` : "Entry stage"}</small>
                  </li>
                ))}
              </ol>
            </article>

            <div className="admin-grid">
              <article className="admin-card">
                <h2>Paid commission totals</h2>
                {data.commissions.length ? (
                  <dl className="admin-money-list">
                    {data.commissions.map((commission) => (
                      <div key={commission.currency}>
                        <dt>{commission.currency}</dt>
                        <dd>{commission.amount}</dd>
                        <small>{commission.paidCommissions} paid commission record{commission.paidCommissions === 1 ? "" : "s"}</small>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <EmptyState>No paid commission values in this period.</EmptyState>
                )}
                <p className="admin-help">Currencies are grouped and displayed separately. No foreign-exchange conversion is applied.</p>
              </article>

              <article className="admin-card">
                <h2>Operational activity</h2>
                <dl className="admin-compact-stats">
                  <div><dt>Total handoffs sent</dt><dd>{summary.totalHandoffsSent}</dd></div>
                  <div><dt>Total confirmed conversions</dt><dd>{summary.totalConfirmedConversions}</dd></div>
                  <div><dt>Total paid commissions</dt><dd>{summary.totalPaidCommissions}</dd></div>
                  <div><dt>Reversed conversion leads</dt><dd>{summary.reversedConversionLeads}</dd></div>
                  <div><dt>Unattributed leads</dt><dd>{summary.unattributedLeads}</dd></div>
                </dl>
              </article>
            </div>
          </section>

          <section className="admin-section" aria-labelledby="insurance-breakdown-title">
            <div className="admin-section-heading"><h2 id="insurance-breakdown-title">Insurance type breakdown</h2></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Insurance</th><th>Form starts</th><th>Leads</th><th>Handed off</th><th>Confirmed</th><th>Paid</th><th>Lead rate</th><th>Confirmed rate</th></tr></thead>
                <tbody>
                  {data.insurance.map((row) => (
                    <tr key={row.insuranceType}>
                      <td>{formatAdminLabel(row.insuranceType)}</td>
                      <td>{row.formStarts}</td>
                      <td>{row.leads}</td>
                      <td>{row.handedOffLeads}</td>
                      <td>{row.confirmedConversionLeads}</td>
                      <td>{row.paidCommissionLeads}</td>
                      <td>{formatAnalyticsRate(row.leads, row.formStarts)}</td>
                      <td>{formatAnalyticsRate(row.confirmedConversionLeads, row.leads)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section" aria-labelledby="acquisition-title">
            <div className="admin-section-heading"><h2 id="acquisition-title">Acquisition sources</h2></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Source</th><th>Medium</th><th>Campaign</th><th>Sessions</th><th>Form starts</th><th>Leads</th><th>Confirmed</th><th>Paid</th></tr></thead>
                <tbody>
                  {data.attribution.map((row, index) => (
                    <tr key={`${row.source}:${row.medium}:${row.campaign}:${index}`}>
                      <td>{row.source}</td><td>{row.medium}</td><td>{row.campaign}</td>
                      <td>{row.sessions}</td><td>{row.formStarts}</td><td>{row.leads}</td>
                      <td>{row.confirmedConversionLeads}</td><td>{row.paidCommissionLeads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.attribution.length ? <EmptyState>No traffic analytics or attributed leads recorded in this period.</EmptyState> : null}
            </div>
          </section>

          <section className="admin-section admin-grid admin-grid-2" aria-label="Page breakdowns">
            <article>
              <div className="admin-section-heading"><h2>Top landing pages</h2></div>
              <div className="admin-table-wrap">
                <table className="admin-table admin-table-compact">
                  <thead><tr><th>Path</th><th>Sessions</th><th>Attributed leads</th></tr></thead>
                  <tbody>{data.landingPages.map((row) => <tr key={row.path}><td className="admin-code">{row.path}</td><td>{row.sessions}</td><td>{row.attributedLeads}</td></tr>)}</tbody>
                </table>
                {!data.landingPages.length ? <EmptyState>No landing-page data recorded yet.</EmptyState> : null}
              </div>
            </article>

            <article>
              <div className="admin-section-heading"><h2>Top viewed pages</h2></div>
              <div className="admin-table-wrap">
                <table className="admin-table admin-table-compact">
                  <thead><tr><th>Path</th><th>Page views</th></tr></thead>
                  <tbody>{data.topPages.map((row) => <tr key={row.path}><td className="admin-code">{row.path}</td><td>{row.pageViews}</td></tr>)}</tbody>
                </table>
                {!data.topPages.length ? <EmptyState>No page views recorded yet.</EmptyState> : null}
              </div>
            </article>
          </section>
        </>
      )}
    </>
  );
}
