import {
  getComparisonDefinitions,
  notStatedFact,
} from "./comparison-definitions";
import {
  COMPARISON_RESULT_TYPES,
  type ComparisonBehavior,
  type ComparisonFact,
  type ComparisonResultType,
  type ComparisonSummaryCounts,
  type CustomerComparisonRow,
  type InsuranceComparisonFacts,
} from "./comparison-types";
import type { PartnerInsuranceType } from "./partner-types";

function normalizedText(value: string | undefined) {
  return value?.trim().toLocaleLowerCase("en") ?? "";
}

function compareDecimalStrings(left: string, right: string) {
  const [leftWhole, leftFraction = ""] = left.split(".");
  const [rightWhole, rightFraction = ""] = right.split(".");
  const scale = Math.max(leftFraction.length, rightFraction.length);
  const leftValue = BigInt(
    leftWhole + leftFraction.padEnd(scale, "0")
  );
  const rightValue = BigInt(
    rightWhole + rightFraction.padEnd(scale, "0")
  );
  return leftValue === rightValue ? 0 : leftValue > rightValue ? 1 : -1;
}

function compareStatedValues(
  currentValue: string,
  offerValue: string,
  currentUnit: string,
  offerUnit: string
): ComparisonResultType {
  if (normalizedText(currentUnit) !== normalizedText(offerUnit)) {
    return "not_comparable";
  }
  const comparison = compareDecimalStrings(currentValue, offerValue);
  return comparison === 0 ? "same" : comparison < 0 ? "higher" : "lower";
}

export function compareFacts(
  current: ComparisonFact,
  offer: ComparisonFact
): ComparisonResultType {
  if (current.kind !== offer.kind) return "not_comparable";

  if (current.kind === "coverage" && offer.kind === "coverage") {
    if (
      current.status === "not_stated" ||
      offer.status === "not_stated"
    ) {
      return "not_stated";
    }
    if (
      current.status === "not_applicable" ||
      offer.status === "not_applicable"
    ) {
      return current.status === offer.status
        ? "not_applicable"
        : "not_comparable";
    }
    if (
      current.status === "not_included" &&
      offer.status === "included"
    ) {
      return "added";
    }
    if (
      current.status === "included" &&
      offer.status === "not_included"
    ) {
      return "removed";
    }
    if (current.status !== offer.status) return "different";

    const currentHasLimit =
      current.limit_amount !== undefined ||
      current.limit_currency !== undefined;
    const offerHasLimit =
      offer.limit_amount !== undefined ||
      offer.limit_currency !== undefined;
    if (currentHasLimit || offerHasLimit) {
      if (
        !current.limit_amount ||
        !current.limit_currency ||
        !offer.limit_amount ||
        !offer.limit_currency
      ) {
        return "not_stated";
      }
      return compareStatedValues(
        current.limit_amount,
        offer.limit_amount,
        current.limit_currency,
        offer.limit_currency
      );
    }

    if (
      normalizedText(current.note) &&
      normalizedText(offer.note) &&
      normalizedText(current.note) !== normalizedText(offer.note)
    ) {
      return "different";
    }
    return "same";
  }

  if (current.kind === "money" && offer.kind === "money") {
    if (current.state === "not_stated" || offer.state === "not_stated") {
      return "not_stated";
    }
    if (
      current.state === "not_applicable" ||
      offer.state === "not_applicable"
    ) {
      return current.state === offer.state
        ? "not_applicable"
        : "not_comparable";
    }
    if (
      !current.amount ||
      !current.currency ||
      !offer.amount ||
      !offer.currency
    ) {
      return "not_stated";
    }
    return compareStatedValues(
      current.amount,
      offer.amount,
      current.currency,
      offer.currency
    );
  }

  if (current.kind === "number" && offer.kind === "number") {
    if (current.state === "not_stated" || offer.state === "not_stated") {
      return "not_stated";
    }
    if (
      current.state === "not_applicable" ||
      offer.state === "not_applicable"
    ) {
      return current.state === offer.state
        ? "not_applicable"
        : "not_comparable";
    }
    if (!current.value || !current.unit || !offer.value || !offer.unit) {
      return "not_stated";
    }
    return compareStatedValues(
      current.value,
      offer.value,
      current.unit,
      offer.unit
    );
  }

  if (current.kind === "text" && offer.kind === "text") {
    if (current.state === "not_stated" || offer.state === "not_stated") {
      return "not_stated";
    }
    if (
      current.state === "not_applicable" ||
      offer.state === "not_applicable"
    ) {
      return current.state === offer.state
        ? "not_applicable"
        : "not_comparable";
    }
    if (!current.value || !offer.value) return "not_stated";
    return normalizedText(current.value) === normalizedText(offer.value)
      ? "same"
      : "different";
  }

  return "not_comparable";
}

export function comparisonResultLabel(
  result: ComparisonResultType,
  behavior: ComparisonBehavior
) {
  if (result === "same") {
    if (behavior === "premium") return "Same premium";
    if (behavior === "deductible") return "Same deductible";
    if (behavior === "limit") return "Same limit";
    return "Same";
  }
  if (result === "higher") {
    if (behavior === "premium") return "Higher premium";
    if (behavior === "deductible") return "Higher deductible";
    if (behavior === "limit" || behavior === "coverage") return "Higher limit";
    return "Higher";
  }
  if (result === "lower") {
    if (behavior === "premium") return "Lower premium";
    if (behavior === "deductible") return "Lower deductible";
    if (behavior === "limit" || behavior === "coverage") return "Lower limit";
    return "Lower";
  }
  if (result === "not_stated") return "Not stated";
  if (result === "not_comparable") return "Not comparable";
  if (result === "not_applicable") return "Not applicable";
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function buildComparisonRows(
  insuranceType: PartnerInsuranceType,
  currentFacts: InsuranceComparisonFacts,
  offerFacts: readonly InsuranceComparisonFacts[]
): CustomerComparisonRow[] {
  return getComparisonDefinitions(insuranceType).map((definition) => {
    const currentValue =
      currentFacts[definition.key] ?? notStatedFact(definition.kind);
    return {
      key: definition.key,
      label: definition.label,
      section: definition.section,
      current_value: currentValue,
      offers: offerFacts.map((facts, offerIndex) => {
        const value = facts[definition.key] ?? notStatedFact(definition.kind);
        const result = compareFacts(currentValue, value);
        return {
          offer_index: offerIndex,
          value,
          result,
          result_label: comparisonResultLabel(result, definition.behavior),
        };
      }),
    };
  });
}

export function emptyComparisonSummary(): ComparisonSummaryCounts {
  return Object.fromEntries(
    COMPARISON_RESULT_TYPES.map((result) => [result, 0])
  ) as ComparisonSummaryCounts;
}

export function summarizeOfferResults(
  rows: readonly CustomerComparisonRow[],
  offerIndex: number
) {
  const summary = emptyComparisonSummary();
  for (const row of rows) {
    const result = row.offers.find(
      (offer) => offer.offer_index === offerIndex
    )?.result;
    if (result) summary[result] += 1;
  }
  return summary;
}
