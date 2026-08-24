import type { PartnerInsuranceType } from "./partner-types";

export const COMPARISON_STATUSES = ["draft", "ready", "archived"] as const;
export type ComparisonStatus = (typeof COMPARISON_STATUSES)[number];

export const COMPARISON_OPTION_TYPES = [
  "current_policy",
  "partner_offer",
] as const;
export type ComparisonOptionType = (typeof COMPARISON_OPTION_TYPES)[number];

export const COMPARISON_OPTION_STATUSES = ["active", "removed"] as const;
export type ComparisonOptionStatus =
  (typeof COMPARISON_OPTION_STATUSES)[number];

export const COMPARISON_FACT_STATES = [
  "stated",
  "not_stated",
  "not_applicable",
] as const;
export type ComparisonFactState = (typeof COMPARISON_FACT_STATES)[number];

export const COVERAGE_STATUSES = [
  "included",
  "not_included",
  "optional",
  "not_stated",
  "not_applicable",
] as const;
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number];

export const COMPARISON_RESULT_TYPES = [
  "same",
  "added",
  "removed",
  "higher",
  "lower",
  "different",
  "not_stated",
  "not_comparable",
  "not_applicable",
] as const;
export type ComparisonResultType =
  (typeof COMPARISON_RESULT_TYPES)[number];

export type MoneyFact = {
  kind: "money";
  state: ComparisonFactState;
  amount?: string;
  currency?: string;
};

export type NumberFact = {
  kind: "number";
  state: ComparisonFactState;
  value?: string;
  unit?: string;
};

export type TextFact = {
  kind: "text";
  state: ComparisonFactState;
  value?: string;
};

export type CoverageFact = {
  kind: "coverage";
  status: CoverageStatus;
  limit_amount?: string;
  limit_currency?: string;
  note?: string;
};

export type ComparisonFact =
  | MoneyFact
  | NumberFact
  | TextFact
  | CoverageFact;

export type ComparisonFieldKey =
  | "premium"
  | "deductible"
  | "medical_expenses_limit"
  | "emergency_evacuation"
  | "repatriation"
  | "trip_cancellation_limit"
  | "trip_interruption_limit"
  | "baggage_limit"
  | "single_item_baggage_limit"
  | "travel_delay"
  | "personal_liability"
  | "winter_sports"
  | "pre_existing_conditions"
  | "geographical_area"
  | "maximum_trip_duration"
  | "third_party_liability_limit"
  | "collision"
  | "comprehensive"
  | "theft"
  | "fire"
  | "glass"
  | "roadside_assistance"
  | "replacement_vehicle"
  | "legal_expenses"
  | "personal_accident"
  | "territorial_cover"
  | "driver_restrictions"
  | "building_cover"
  | "contents_cover"
  | "earthquake"
  | "flood"
  | "storm"
  | "accidental_damage"
  | "personal_or_public_liability"
  | "alternative_accommodation"
  | "valuables"
  | "loss_of_rent"
  | "occupancy_or_use_conditions";

export type InsuranceComparisonFacts =
  Partial<Record<ComparisonFieldKey, ComparisonFact>>;

export type ComparisonBehavior =
  | "premium"
  | "deductible"
  | "limit"
  | "coverage"
  | "text"
  | "number";

export type ComparisonFieldDefinition = {
  key: ComparisonFieldKey;
  label: string;
  section: "Price" | "Core cover" | "Additional cover" | "Limits" | "Conditions";
  kind: ComparisonFact["kind"];
  behavior: ComparisonBehavior;
  sortOrder: number;
};

export type PolicyComparison = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  lead_id: string;
  insurance_type: PartnerInsuranceType;
  status: ComparisonStatus;
  title: string;
  customer_intro: string | null;
  internal_note: string | null;
  version: number;
  ready_at: string | null;
  archived_at: string | null;
};

export type PolicyComparisonOption = {
  id: string;
  created_at: string;
  updated_at: string;
  comparison_id: string;
  option_type: ComparisonOptionType;
  status: ComparisonOptionStatus;
  sort_order: number;
  partner_id: string | null;
  handoff_id: string | null;
  provider_name: string;
  product_name: string | null;
  internal_reference: string | null;
  effective_from: string | null;
  effective_to: string | null;
  facts: InsuranceComparisonFacts;
  customer_note: string | null;
  internal_note: string | null;
  version: number;
};

export type PolicyComparisonShare = {
  id: string;
  comparison_id: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  source_version: number;
};

export type CustomerSafeComparisonOption = {
  provider_name: string;
  product_name: string | null;
  effective_from: string | null;
  effective_to: string | null;
  customer_note: string | null;
  facts: InsuranceComparisonFacts;
};

export type CustomerComparisonOfferResult = {
  offer_index: number;
  value: ComparisonFact;
  result: ComparisonResultType;
  result_label: string;
};

export type CustomerComparisonRow = {
  key: ComparisonFieldKey;
  label: string;
  section: string;
  current_value: ComparisonFact;
  offers: CustomerComparisonOfferResult[];
};

export type ComparisonSummaryCounts = Record<ComparisonResultType, number>;

export type CustomerComparisonOffer = CustomerSafeComparisonOption & {
  summary: ComparisonSummaryCounts;
};

export type CustomerComparisonSnapshot = {
  schema_version: 1;
  generated_at: string;
  insurance_type: PartnerInsuranceType;
  title: string;
  customer_intro: string | null;
  current_policy: CustomerSafeComparisonOption;
  offers: CustomerComparisonOffer[];
  comparisons: CustomerComparisonRow[];
};

export type ComparisonPartnerChoice = {
  id: string;
  name: string;
};

export type ComparisonHandoffChoice = {
  id: string;
  partner_id: string;
  status: string;
};

