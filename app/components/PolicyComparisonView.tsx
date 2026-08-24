import type {
  ComparisonFact,
  ComparisonResultType,
  CustomerComparisonSnapshot,
} from "../lib/comparison-types";
import styles from "./PolicyComparisonView.module.css";

function factLabel(fact: ComparisonFact) {
  if (fact.kind === "coverage") {
    const status = fact.status.replaceAll("_", " ");
    const limit = fact.limit_amount && fact.limit_currency
      ? ` · ${fact.limit_currency} ${fact.limit_amount}`
      : "";
    return `${status.charAt(0).toUpperCase()}${status.slice(1)}${limit}${fact.note ? ` · ${fact.note}` : ""}`;
  }
  if (fact.state === "not_stated") return "Not stated";
  if (fact.state === "not_applicable") return "Not applicable";
  if (fact.kind === "money") return `${fact.currency} ${fact.amount}`;
  if (fact.kind === "number") return `${fact.value} ${fact.unit}`;
  return fact.value ?? "Not stated";
}

const summaryLabels: Record<ComparisonResultType, string> = {
  same: "Same",
  added: "Added",
  removed: "Removed",
  higher: "Higher",
  lower: "Lower",
  different: "Different",
  not_stated: "Not stated",
  not_comparable: "Not comparable",
  not_applicable: "Not applicable",
};

export default function PolicyComparisonView({
  snapshot,
  referralCtas,
}: {
  snapshot: CustomerComparisonSnapshot;
  referralCtas?: Array<{ href: string; label: string } | null>;
}) {
  return (
    <article className={styles.shell}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Factual policy comparison</p>
        <h1>{snapshot.title}</h1>
        {snapshot.customer_intro ? <p className={styles.lead}>{snapshot.customer_intro}</p> : null}
      </header>

      <div className={styles.notice}>
        This is a factual summary of information entered from the current policy and partner offers. It does not tell you which policy to choose and is not regulated insurance advice. Price differences do not indicate whether a policy is suitable for you. Check the complete policy wording, exclusions, eligibility and final terms supplied by the relevant licensed insurance partner.
      </div>

      {snapshot.offers.map((offer, offerIndex) => (
        <section className={styles.section} key={`${offer.provider_name}-${offerIndex}`}>
          <h2>{offer.provider_name}{offer.product_name ? ` — ${offer.product_name}` : ""}</h2>
          <div className={styles.summaryGrid} aria-label={`Factual result counts for ${offer.provider_name}`}>
            {Object.entries(offer.summary).map(([result, count]) => (
              <div className={styles.summary} key={result}>
                <span>{summaryLabels[result as ComparisonResultType]}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>

          <div className={`${styles.tableWrap} ${styles.desktopTable}`}>
            <table className={styles.table}>
              <thead><tr><th>Fact</th><th>Current policy</th><th>Partner offer</th></tr></thead>
              <tbody>
                {snapshot.comparisons.map((row) => {
                  const offerResult = row.offers[offerIndex];
                  return (
                    <tr key={row.key}>
                      <td className={styles.field}>{row.label}</td>
                      <td><span className={styles.value}>{factLabel(row.current_value)}</span></td>
                      <td>
                        <span className={styles.value}>{factLabel(offerResult.value)}</span>
                        <span className={styles.result}>{offerResult.result_label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileRows}>
            {snapshot.comparisons.map((row) => {
              const offerResult = row.offers[offerIndex];
              return (
                <section className={styles.card} key={row.key}>
                  <h3>{row.label}</h3>
                  <dl>
                    <div><dt>Current policy</dt><dd>{factLabel(row.current_value)}</dd></div>
                    <div><dt>Partner offer</dt><dd>{factLabel(offerResult.value)}<br /><span className={styles.result}>{offerResult.result_label}</span></dd></div>
                  </dl>
                </section>
              );
            })}
          </div>
          {offer.customer_note ? <p className={styles.finePrint}>{offer.customer_note}</p> : null}
          {referralCtas?.[offerIndex] ? (
            <div className={styles.referralAction}>
              <a href={referralCtas[offerIndex]!.href} rel="nofollow sponsored noopener noreferrer">
                {referralCtas[offerIndex]!.label}
              </a>
              <p>The Meta Insurance is a technology and referral platform. Insurance products, pricing, eligibility, regulated advice and final terms are provided by the relevant licensed insurance provider or partner. The Meta Insurance may receive referral or affiliate compensation.</p>
            </div>
          ) : null}
        </section>
      ))}

      <footer className={styles.finePrint}>
        The Meta Insurance is a technology, referral and affiliate platform. It is not currently an insurer or licensed insurance broker and may receive a referral or affiliate commission. Insurance products, eligibility decisions, regulated advice and final terms are provided by relevant licensed insurance partners.
      </footer>
    </article>
  );
}
