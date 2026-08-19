export const MAX_REQUEST_BODY_BYTES = 32 * 1024;

const MAX_DETAILS_BYTES = 25 * 1024;
const ALLOWED_INSURANCE_TYPES = new Set([
  "travel",
  "motor",
  "property",
]);
const PREFERRED_CONTACT_METHODS = new Map([
  ["email", "Email"],
  ["phone", "Phone"],
  ["whatsapp", "WhatsApp"],
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9 ()-]+$/;
const POLICY_PATH_PATTERN =
  /^(?:motor|property)\/[A-Za-z0-9][A-Za-z0-9._/-]*$/;

export type ValidatedLead = {
  insurance_type: "travel" | "motor" | "property";
  full_name: string;
  email: string | null;
  phone: string | null;
  preferred_contact: string | null;
  policy_document_path: string | null;
  consent: true;
  details: Record<string, unknown>;
};

export type LeadValidationResult =
  | {
      success: true;
      data: ValidatedLead;
    }
  | {
      success: false;
      error: string;
    };

function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

function optionalTrimmedString(
  value: unknown
): string | null | undefined {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || null;
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function isLeadRequestBodyTooLarge(
  rawBody: string
) {
  return byteLength(rawBody) > MAX_REQUEST_BODY_BYTES;
}

export function validateLeadBody(
  value: unknown
): LeadValidationResult {
  if (!isPlainObject(value)) {
    return {
      success: false,
      error: "Invalid request data.",
    };
  }

  if (typeof value.insurance_type !== "string") {
    return {
      success: false,
      error: "Invalid insurance type.",
    };
  }

  const insuranceType = value.insurance_type
    .trim()
    .toLowerCase();

  if (!ALLOWED_INSURANCE_TYPES.has(insuranceType)) {
    return {
      success: false,
      error: "Invalid insurance type.",
    };
  }

  if (typeof value.full_name !== "string") {
    return {
      success: false,
      error: "Full name is required.",
    };
  }

  const fullName = value.full_name.trim();

  if (fullName.length < 2) {
    return {
      success: false,
      error: "Full name must be at least 2 characters.",
    };
  }

  if (fullName.length > 150) {
    return {
      success: false,
      error: "Full name must be 150 characters or fewer.",
    };
  }

  const emailValue = optionalTrimmedString(value.email);

  if (emailValue === undefined) {
    return {
      success: false,
      error: "Email must be a valid email address.",
    };
  }

  const email = emailValue?.toLowerCase() ?? null;

  if (
    email &&
    (email.length > 254 || !EMAIL_PATTERN.test(email))
  ) {
    return {
      success: false,
      error: "Email must be a valid email address.",
    };
  }

  const phone = optionalTrimmedString(value.phone);

  if (phone === undefined) {
    return {
      success: false,
      error: "Phone number is invalid.",
    };
  }

  if (phone) {
    const digitCount = phone.replace(/\D/g, "").length;

    if (
      phone.length > 50 ||
      !PHONE_PATTERN.test(phone) ||
      digitCount < 7 ||
      digitCount > 15
    ) {
      return {
        success: false,
        error: "Phone number is invalid.",
      };
    }
  }

  if (!email && !phone) {
    return {
      success: false,
      error:
        "Please provide an email address or phone number.",
    };
  }

  const preferredContactValue = optionalTrimmedString(
    value.preferred_contact
  );

  if (preferredContactValue === undefined) {
    return {
      success: false,
      error: "Preferred contact method is invalid.",
    };
  }

  let preferredContact: string | null = null;

  if (preferredContactValue) {
    preferredContact =
      PREFERRED_CONTACT_METHODS.get(
        preferredContactValue.toLowerCase()
      ) ?? null;

    if (!preferredContact) {
      return {
        success: false,
        error: "Preferred contact method is invalid.",
      };
    }
  }

  if (value.consent !== true) {
    return {
      success: false,
      error:
        "Consent is required before submitting the request.",
    };
  }

  const policyPath = optionalTrimmedString(
    value.policy_document_path
  );

  if (policyPath === undefined) {
    return {
      success: false,
      error: "Policy document path is invalid.",
    };
  }

  if (policyPath) {
    const pathSegments = policyPath.split("/");
    const hasUnsafeSegment = pathSegments.some(
      (segment) =>
        !segment || segment === "." || segment === ".."
    );

    if (
      policyPath.length > 500 ||
      policyPath.includes("\0") ||
      policyPath.includes("\\") ||
      /^https?:\/\//i.test(policyPath) ||
      !POLICY_PATH_PATTERN.test(policyPath) ||
      hasUnsafeSegment
    ) {
      return {
        success: false,
        error: "Policy document path is invalid.",
      };
    }
  }

  let details: Record<string, unknown> = {};

  if (value.details !== undefined) {
    if (!isPlainObject(value.details)) {
      return {
        success: false,
        error: "Request details must be a valid object.",
      };
    }

    let serializedDetails: string;

    try {
      serializedDetails = JSON.stringify(value.details);
    } catch {
      return {
        success: false,
        error: "Request details must be valid JSON.",
      };
    }

    if (byteLength(serializedDetails) > MAX_DETAILS_BYTES) {
      return {
        success: false,
        error: "Request details are too large.",
      };
    }

    details = value.details;
  }

  return {
    success: true,
    data: {
      insurance_type:
        insuranceType as ValidatedLead["insurance_type"],
      full_name: fullName,
      email,
      phone,
      preferred_contact: preferredContact,
      policy_document_path: policyPath,
      consent: true,
      details,
    },
  };
}
