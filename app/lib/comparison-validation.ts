import { getComparisonDefinition } from "./comparison-definitions";
import {
  COMPARISON_FACT_STATES,
  COMPARISON_OPTION_TYPES,
  COMPARISON_STATUSES,
  COVERAGE_STATUSES,
  type ComparisonFact,
  type ComparisonOptionType,
  type ComparisonStatus,
  type InsuranceComparisonFacts,
} from "./comparison-types";
import {
  PARTNER_INSURANCE_TYPES,
  type PartnerInsuranceType,
} from "./partner-types";

export const COMPARISON_METADATA_BODY_BYTES = 16 * 1024;
export const COMPARISON_OPTION_BODY_BYTES = 96 * 1024;
export const COMPARISON_SHARE_BODY_BYTES = 8 * 1024;
export const COMPARISON_FACTS_MAX_BYTES = 60 * 1024;
export const COMPARISON_SNAPSHOT_MAX_BYTES = 300 * 1024;
export const COMPARISON_TITLE_MAX_LENGTH = 180;
export const COMPARISON_CUSTOMER_INTRO_MAX_LENGTH = 1000;
export const COMPARISON_INTERNAL_NOTE_MAX_LENGTH = 2000;
export const COMPARISON_PROVIDER_MAX_LENGTH = 200;
export const COMPARISON_PRODUCT_MAX_LENGTH = 200;
export const COMPARISON_INTERNAL_REFERENCE_MAX_LENGTH = 250;
export const COMPARISON_CUSTOMER_NOTE_MAX_LENGTH = 1000;
export const COMPARISON_OPTION_NOTE_MAX_LENGTH = 2000;
export const COMPARISON_PAGE_SIZE = 25;
export const COMPARISON_MAX_ACTIVE_OFFERS = 5;
export const COMPARISON_SHARE_EXPIRY_DAYS = [7, 14, 30, 60, 90] as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MONEY_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;
const NUMBER_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,4})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const HTML_PATTERN = /<[^>]*>/;
const SEARCH_PATTERN = /^[\p{L}\p{N} .,'&()/_-]+$/u;

export type ComparisonValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function onlyHasKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[]
) {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function normalizeText(
  value: unknown,
  maxLength: number,
  required = false
): string | null | undefined {
  if (value === undefined || value === null || value === "") {
    return required ? undefined : null;
  }
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (
    (!normalized && required) ||
    normalized.length > maxLength ||
    CONTROL_CHARACTER_PATTERN.test(normalized) ||
    HTML_PATTERN.test(normalized)
  ) {
    return undefined;
  }
  return normalized || null;
}

function jsonBytes(value: unknown) {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

function optionalDate(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  return validDate(value) ? value : undefined;
}

export function isComparisonUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function isValidComparisonMoney(value: unknown): value is string {
  return typeof value === "string" && MONEY_PATTERN.test(value);
}

export function isValidComparisonCurrency(value: unknown): value is string {
  return typeof value === "string" && CURRENCY_PATTERN.test(value);
}

function validateMoneyFact(
  value: Record<string, unknown>
): ComparisonFact | null {
  if (
    !onlyHasKeys(value, ["kind", "state", "amount", "currency"]) ||
    value.kind !== "money" ||
    !isOneOf(value.state, COMPARISON_FACT_STATES)
  ) {
    return null;
  }
  if (value.state !== "stated") {
    return value.amount === undefined && value.currency === undefined
      ? { kind: "money", state: value.state }
      : null;
  }
  if (
    !isValidComparisonMoney(value.amount) ||
    !isValidComparisonCurrency(value.currency)
  ) {
    return null;
  }
  return {
    kind: "money",
    state: "stated",
    amount: value.amount,
    currency: value.currency,
  };
}

function validateNumberFact(
  value: Record<string, unknown>
): ComparisonFact | null {
  if (
    !onlyHasKeys(value, ["kind", "state", "value", "unit"]) ||
    value.kind !== "number" ||
    !isOneOf(value.state, COMPARISON_FACT_STATES)
  ) {
    return null;
  }
  if (value.state !== "stated") {
    return value.value === undefined && value.unit === undefined
      ? { kind: "number", state: value.state }
      : null;
  }
  const unit = normalizeText(value.unit, 30, true);
  if (
    typeof value.value !== "string" ||
    !NUMBER_PATTERN.test(value.value) ||
    !unit
  ) {
    return null;
  }
  return { kind: "number", state: "stated", value: value.value, unit };
}

function validateTextFact(
  value: Record<string, unknown>
): ComparisonFact | null {
  if (
    !onlyHasKeys(value, ["kind", "state", "value"]) ||
    value.kind !== "text" ||
    !isOneOf(value.state, COMPARISON_FACT_STATES)
  ) {
    return null;
  }
  if (value.state !== "stated") {
    return value.value === undefined
      ? { kind: "text", state: value.state }
      : null;
  }
  const text = normalizeText(value.value, 500, true);
  return text
    ? { kind: "text", state: "stated", value: text }
    : null;
}

function validateCoverageFact(
  value: Record<string, unknown>
): ComparisonFact | null {
  if (
    !onlyHasKeys(value, [
      "kind",
      "status",
      "limit_amount",
      "limit_currency",
      "note",
    ]) ||
    value.kind !== "coverage" ||
    !isOneOf(value.status, COVERAGE_STATUSES)
  ) {
    return null;
  }

  const note = normalizeText(value.note, 300);
  if (note === undefined) return null;
  const hasAmount = value.limit_amount !== undefined;
  const hasCurrency = value.limit_currency !== undefined;
  if (hasAmount !== hasCurrency) return null;
  if (
    hasAmount &&
    (
      !["included", "optional"].includes(value.status) ||
      !isValidComparisonMoney(value.limit_amount) ||
      !isValidComparisonCurrency(value.limit_currency)
    )
  ) {
    return null;
  }

  return {
    kind: "coverage",
    status: value.status,
    ...(hasAmount
      ? {
          limit_amount: value.limit_amount as string,
          limit_currency: value.limit_currency as string,
        }
      : {}),
    ...(note ? { note } : {}),
  };
}

export function validateComparisonFacts(
  insuranceType: PartnerInsuranceType,
  value: unknown
): ComparisonValidationResult<InsuranceComparisonFacts> {
  if (
    !isPlainObject(value) ||
    jsonBytes(value) > COMPARISON_FACTS_MAX_BYTES
  ) {
    return { success: false, error: "Invalid comparison facts." };
  }

  const facts: InsuranceComparisonFacts = {};
  for (const [key, candidate] of Object.entries(value)) {
    const definition = getComparisonDefinition(
      insuranceType,
      key as keyof InsuranceComparisonFacts
    );
    if (!definition || !isPlainObject(candidate)) {
      return { success: false, error: "Invalid comparison facts." };
    }

    const fact =
      definition.kind === "money"
        ? validateMoneyFact(candidate)
        : definition.kind === "number"
          ? validateNumberFact(candidate)
          : definition.kind === "text"
            ? validateTextFact(candidate)
            : validateCoverageFact(candidate);
    if (!fact || fact.kind !== definition.kind) {
      return { success: false, error: "Invalid comparison facts." };
    }
    facts[definition.key] = fact;
  }

  return { success: true, data: facts };
}

export function hasSubstantiveComparisonFact(
  facts: InsuranceComparisonFacts
) {
  return Object.values(facts).some((fact) =>
    fact.kind === "coverage"
      ? fact.status !== "not_stated"
      : fact.state !== "not_stated"
  );
}

export function validateComparisonCreateInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["lead_id", "title", "internal_note"]) ||
    !isComparisonUuid(value.lead_id)
  ) {
    return { success: false, error: "Invalid comparison data." } as const;
  }
  const title = normalizeText(value.title, COMPARISON_TITLE_MAX_LENGTH, true);
  const internalNote = normalizeText(
    value.internal_note,
    COMPARISON_INTERNAL_NOTE_MAX_LENGTH
  );
  if (!title || internalNote === undefined) {
    return { success: false, error: "Invalid comparison data." } as const;
  }
  return {
    success: true,
    data: { leadId: value.lead_id, title, internalNote },
  } as const;
}

export function validateComparisonUpdateInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["title", "customer_intro", "internal_note"])
  ) {
    return { success: false, error: "Invalid comparison data." } as const;
  }
  const title = normalizeText(value.title, COMPARISON_TITLE_MAX_LENGTH, true);
  const customerIntro = normalizeText(
    value.customer_intro,
    COMPARISON_CUSTOMER_INTRO_MAX_LENGTH
  );
  const internalNote = normalizeText(
    value.internal_note,
    COMPARISON_INTERNAL_NOTE_MAX_LENGTH
  );
  if (!title || customerIntro === undefined || internalNote === undefined) {
    return { success: false, error: "Invalid comparison data." } as const;
  }
  return {
    success: true,
    data: { title, customerIntro, internalNote },
  } as const;
}

export function validateComparisonStatusInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["status"]) ||
    !isOneOf(value.status, COMPARISON_STATUSES)
  ) {
    return { success: false, error: "Invalid comparison data." } as const;
  }
  return {
    success: true,
    data: { status: value.status as ComparisonStatus },
  } as const;
}

type OptionInput = {
  providerName: string;
  productName: string | null;
  internalReference: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  facts: InsuranceComparisonFacts;
  customerNote: string | null;
  internalNote: string | null;
  sortOrder: number;
};

function validateOptionFields(
  value: Record<string, unknown>,
  insuranceType: PartnerInsuranceType
): ComparisonValidationResult<OptionInput> {
  const providerName = normalizeText(
    value.provider_name,
    COMPARISON_PROVIDER_MAX_LENGTH,
    true
  );
  const productName = normalizeText(value.product_name, COMPARISON_PRODUCT_MAX_LENGTH);
  const internalReference = normalizeText(
    value.internal_reference,
    COMPARISON_INTERNAL_REFERENCE_MAX_LENGTH
  );
  const customerNote = normalizeText(
    value.customer_note,
    COMPARISON_CUSTOMER_NOTE_MAX_LENGTH
  );
  const internalNote = normalizeText(
    value.internal_note,
    COMPARISON_OPTION_NOTE_MAX_LENGTH
  );
  const effectiveFrom = optionalDate(value.effective_from);
  const effectiveTo = optionalDate(value.effective_to);
  const sortOrder =
    typeof value.sort_order === "number"
      ? value.sort_order
      : Number(value.sort_order);
  const facts = validateComparisonFacts(insuranceType, value.facts);

  if (
    !providerName ||
    productName === undefined ||
    internalReference === undefined ||
    customerNote === undefined ||
    internalNote === undefined ||
    effectiveFrom === undefined ||
    effectiveTo === undefined ||
    !Number.isSafeInteger(sortOrder) ||
    sortOrder < 0 ||
    sortOrder > 100 ||
    (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) ||
    facts.success === false
  ) {
    return { success: false, error: "Invalid comparison data." };
  }

  return {
    success: true,
    data: {
      providerName,
      productName,
      internalReference,
      effectiveFrom,
      effectiveTo,
      facts: facts.data,
      customerNote,
      internalNote,
      sortOrder,
    },
  };
}

export function validateComparisonOptionCreateInput(
  value: unknown,
  insuranceType: PartnerInsuranceType
) {
  const allowedKeys = [
    "option_type",
    "partner_id",
    "handoff_id",
    "provider_name",
    "product_name",
    "internal_reference",
    "effective_from",
    "effective_to",
    "facts",
    "customer_note",
    "internal_note",
    "sort_order",
  ];
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, allowedKeys) ||
    !isOneOf(value.option_type, COMPARISON_OPTION_TYPES)
  ) {
    return { success: false, error: "Invalid comparison data." } as const;
  }

  const partnerId =
    value.partner_id === null || value.partner_id === ""
      ? null
      : value.partner_id;
  const handoffId =
    value.handoff_id === null || value.handoff_id === ""
      ? null
      : value.handoff_id;
  if (
    (partnerId !== null && !isComparisonUuid(partnerId)) ||
    (handoffId !== null && !isComparisonUuid(handoffId)) ||
    (value.option_type === "current_policy" &&
      (partnerId !== null || handoffId !== null)) ||
    (value.option_type === "partner_offer" && partnerId === null)
  ) {
    return { success: false, error: "Invalid comparison data." } as const;
  }

  const fields = validateOptionFields(value, insuranceType);
  if (fields.success === false) return fields;
  return {
    success: true,
    data: {
      optionType: value.option_type as ComparisonOptionType,
      partnerId: partnerId as string | null,
      handoffId: handoffId as string | null,
      ...fields.data,
    },
  } as const;
}

export function validateComparisonOptionUpdateInput(
  value: unknown,
  insuranceType: PartnerInsuranceType
) {
  const allowedKeys = [
    "provider_name",
    "product_name",
    "internal_reference",
    "effective_from",
    "effective_to",
    "facts",
    "customer_note",
    "internal_note",
    "sort_order",
  ];
  if (!isPlainObject(value) || !onlyHasKeys(value, allowedKeys)) {
    return { success: false, error: "Invalid comparison data." } as const;
  }
  return validateOptionFields(value, insuranceType);
}

export function validateComparisonListFilters(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["status", "insurance_type", "search", "page"])
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  const status =
    value.status === "all" || value.status == null ? null : value.status;
  const insuranceType =
    value.insurance_type === "all" || value.insurance_type == null
      ? null
      : value.insurance_type;
  const search = normalizeText(value.search, 100);
  const parsedPage = Number(value.page);
  if (
    (status !== null && !isOneOf(status, COMPARISON_STATUSES)) ||
    (insuranceType !== null &&
      !isOneOf(insuranceType, PARTNER_INSURANCE_TYPES)) ||
    search === undefined ||
    (search !== null && !SEARCH_PATTERN.test(search))
  ) {
    return { success: false, error: "Invalid request." } as const;
  }
  return {
    success: true,
    data: {
      status: status as ComparisonStatus | null,
      insuranceType: insuranceType as PartnerInsuranceType | null,
      search,
      page:
        Number.isSafeInteger(parsedPage) && parsedPage > 0
          ? Math.min(parsedPage, 10_000)
          : 1,
    },
  } as const;
}

export function validateComparisonShareInput(value: unknown) {
  if (
    !isPlainObject(value) ||
    !onlyHasKeys(value, ["expiry_days"])
  ) {
    return { success: false, error: "Invalid comparison data." } as const;
  }
  const expiryDays = Number(value.expiry_days);
  if (
    !COMPARISON_SHARE_EXPIRY_DAYS.includes(
      expiryDays as (typeof COMPARISON_SHARE_EXPIRY_DAYS)[number]
    )
  ) {
    return { success: false, error: "Invalid comparison data." } as const;
  }
  return { success: true, data: { expiryDays } } as const;
}

export function isValidComparisonShareToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value);
}

export function isKnownComparisonInsuranceType(
  value: unknown
): value is PartnerInsuranceType {
  return isOneOf(value, PARTNER_INSURANCE_TYPES);
}
