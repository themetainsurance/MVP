import {
  buildComparisonRows,
  summarizeOfferResults,
} from "./comparison-engine";
import {
  COMPARISON_MAX_ACTIVE_OFFERS,
  COMPARISON_SNAPSHOT_MAX_BYTES,
} from "./comparison-validation";
import type {
  CustomerComparisonSnapshot,
  CustomerSafeComparisonOption,
  PolicyComparison,
  PolicyComparisonOption,
} from "./comparison-types";

function customerSafeOption(
  option: PolicyComparisonOption,
  referralOptionIds?: ReadonlySet<string>
): CustomerSafeComparisonOption {
  const safe: CustomerSafeComparisonOption = {
    provider_name: option.provider_name,
    product_name: option.product_name,
    effective_from: option.effective_from,
    effective_to: option.effective_to,
    customer_note: option.customer_note,
    facts: JSON.parse(JSON.stringify(option.facts)),
  };
  if (referralOptionIds?.has(option.id)) safe.referral_available = true;
  return safe;
}

function snapshotBytes(snapshot: CustomerComparisonSnapshot) {
  return new TextEncoder().encode(JSON.stringify(snapshot)).byteLength;
}

export function buildCustomerComparisonSnapshot(
  comparison: PolicyComparison,
  options: readonly PolicyComparisonOption[],
  generatedAt: string,
  referralOptionIds?: ReadonlySet<string>
): CustomerComparisonSnapshot {
  const generatedDate = new Date(generatedAt);
  if (Number.isNaN(generatedDate.getTime())) {
    throw new Error("Comparison snapshot could not be created.");
  }

  const active = options
    .filter((option) => option.status === "active")
    .sort(
      (left, right) =>
        left.sort_order - right.sort_order ||
        left.created_at.localeCompare(right.created_at)
    );
  const currentPolicies = active.filter(
    (option) => option.option_type === "current_policy"
  );
  const partnerOffers = active.filter(
    (option) => option.option_type === "partner_offer"
  );
  if (
    currentPolicies.length !== 1 ||
    partnerOffers.length < 1 ||
    partnerOffers.length > COMPARISON_MAX_ACTIVE_OFFERS
  ) {
    throw new Error("Comparison snapshot could not be created.");
  }

  const currentPolicy = customerSafeOption(currentPolicies[0]);
  const safeOffers = partnerOffers.map((option) =>
    customerSafeOption(option, referralOptionIds)
  );
  const rows = buildComparisonRows(
    comparison.insurance_type,
    currentPolicy.facts,
    safeOffers.map((offer) => offer.facts)
  );

  const snapshot: CustomerComparisonSnapshot = {
    schema_version: 1,
    generated_at: generatedDate.toISOString(),
    insurance_type: comparison.insurance_type,
    title: comparison.title,
    customer_intro: comparison.customer_intro,
    current_policy: currentPolicy,
    offers: safeOffers.map((offer, index) => ({
      ...offer,
      summary: summarizeOfferResults(rows, index),
    })),
    comparisons: rows,
  };

  if (snapshotBytes(snapshot) > COMPARISON_SNAPSHOT_MAX_BYTES) {
    throw new Error("Comparison snapshot could not be created.");
  }
  return snapshot;
}
