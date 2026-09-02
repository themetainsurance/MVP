import type { PartnerInsuranceType } from "./partner-types";
import type {
  ComparisonFact,
  ComparisonFieldDefinition,
  ComparisonFieldKey,
} from "./comparison-types";

const common: ComparisonFieldDefinition[] = [
  {
    key: "premium",
    label: "Premium",
    section: "Price",
    kind: "money",
    behavior: "premium",
    sortOrder: 10,
  },
  {
    key: "deductible",
    label: "Deductible / excess",
    section: "Price",
    kind: "money",
    behavior: "deductible",
    sortOrder: 20,
  },
];

const travel: ComparisonFieldDefinition[] = [
  ...common,
  { key: "medical_expenses_limit", label: "Medical expenses limit", section: "Limits", kind: "money", behavior: "limit", sortOrder: 100 },
  { key: "emergency_evacuation", label: "Emergency evacuation", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 110 },
  { key: "repatriation", label: "Repatriation", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 120 },
  { key: "trip_cancellation_limit", label: "Trip cancellation limit", section: "Limits", kind: "money", behavior: "limit", sortOrder: 130 },
  { key: "trip_interruption_limit", label: "Trip interruption limit", section: "Limits", kind: "money", behavior: "limit", sortOrder: 140 },
  { key: "baggage_limit", label: "Baggage limit", section: "Limits", kind: "money", behavior: "limit", sortOrder: 150 },
  { key: "single_item_baggage_limit", label: "Single-item baggage limit", section: "Limits", kind: "money", behavior: "limit", sortOrder: 160 },
  { key: "travel_delay", label: "Travel delay", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 170 },
  { key: "personal_liability", label: "Personal liability", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 180 },
  { key: "winter_sports", label: "Winter sports", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 190 },
  { key: "pre_existing_conditions", label: "Pre-existing conditions", section: "Conditions", kind: "text", behavior: "text", sortOrder: 200 },
  { key: "geographical_area", label: "Geographical area", section: "Conditions", kind: "text", behavior: "text", sortOrder: 210 },
  { key: "maximum_trip_duration", label: "Maximum trip duration", section: "Conditions", kind: "number", behavior: "number", sortOrder: 220 },
];

const motor: ComparisonFieldDefinition[] = [
  ...common,
  { key: "third_party_liability_limit", label: "Third-party liability limit", section: "Limits", kind: "money", behavior: "limit", sortOrder: 100 },
  { key: "collision", label: "Collision", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 110 },
  { key: "comprehensive", label: "Comprehensive", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 120 },
  { key: "theft", label: "Theft", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 130 },
  { key: "fire", label: "Fire", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 140 },
  { key: "glass", label: "Glass", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 150 },
  { key: "roadside_assistance", label: "Roadside assistance", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 160 },
  { key: "replacement_vehicle", label: "Replacement vehicle", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 170 },
  { key: "legal_expenses", label: "Legal expenses", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 180 },
  { key: "personal_accident", label: "Personal accident", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 190 },
  { key: "territorial_cover", label: "Territorial cover", section: "Conditions", kind: "text", behavior: "text", sortOrder: 200 },
  { key: "driver_restrictions", label: "Driver restrictions", section: "Conditions", kind: "text", behavior: "text", sortOrder: 210 },
];

const property: ComparisonFieldDefinition[] = [
  ...common,
  { key: "building_cover", label: "Building cover", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 100 },
  { key: "contents_cover", label: "Contents cover", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 110 },
  { key: "earthquake", label: "Earthquake", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 120 },
  { key: "flood", label: "Flood", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 130 },
  { key: "storm", label: "Storm", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 140 },
  { key: "fire", label: "Fire", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 150 },
  { key: "theft", label: "Theft", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 160 },
  { key: "accidental_damage", label: "Accidental damage", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 170 },
  { key: "personal_or_public_liability", label: "Personal / public liability", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 180 },
  { key: "alternative_accommodation", label: "Alternative accommodation", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 190 },
  { key: "valuables", label: "Valuables", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 200 },
  { key: "loss_of_rent", label: "Loss of rent", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 210 },
  { key: "occupancy_or_use_conditions", label: "Occupancy / use conditions", section: "Conditions", kind: "text", behavior: "text", sortOrder: 220 },
];

const health: ComparisonFieldDefinition[] = [
  ...common,
  { key: "annual_out_of_pocket_maximum", label: "Annual out-of-pocket maximum", section: "Price", kind: "money", behavior: "limit", sortOrder: 30 },
  { key: "hospitalisation", label: "Hospitalisation", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 100 },
  { key: "outpatient_care", label: "Outpatient care", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 110 },
  { key: "emergency_care", label: "Emergency care", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 120 },
  { key: "specialist_care", label: "Specialist care", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 130 },
  { key: "prescription_drugs", label: "Prescription drugs", section: "Core cover", kind: "coverage", behavior: "coverage", sortOrder: 140 },
  { key: "mental_health", label: "Mental health", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 150 },
  { key: "maternity", label: "Maternity", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 160 },
  { key: "dental", label: "Dental", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 170 },
  { key: "vision", label: "Vision", section: "Additional cover", kind: "coverage", behavior: "coverage", sortOrder: 180 },
  { key: "provider_network", label: "Provider network", section: "Conditions", kind: "text", behavior: "text", sortOrder: 190 },
  { key: "waiting_periods", label: "Waiting periods", section: "Conditions", kind: "text", behavior: "text", sortOrder: 200 },
  { key: "pre_existing_condition_terms", label: "Pre-existing condition terms", section: "Conditions", kind: "text", behavior: "text", sortOrder: 210 },
  { key: "geographic_cover", label: "Geographic cover", section: "Conditions", kind: "text", behavior: "text", sortOrder: 220 },
];

export const COMPARISON_DEFINITIONS: Record<
  PartnerInsuranceType,
  readonly ComparisonFieldDefinition[]
> = { travel, motor, property, health };

export function getComparisonDefinitions(
  insuranceType: PartnerInsuranceType
) {
  return COMPARISON_DEFINITIONS[insuranceType];
}

export function getComparisonDefinition(
  insuranceType: PartnerInsuranceType,
  key: ComparisonFieldKey
) {
  return COMPARISON_DEFINITIONS[insuranceType].find(
    (definition) => definition.key === key
  );
}

export function notStatedFact(kind: ComparisonFact["kind"]): ComparisonFact {
  return kind === "coverage"
    ? { kind, status: "not_stated" }
    : { kind, state: "not_stated" };
}
