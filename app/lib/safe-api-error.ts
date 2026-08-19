const SAFE_API_ERROR_MESSAGES = new Set([
  "Invalid request data.",
  "Invalid insurance type.",
  "Full name is required.",
  "Full name must be at least 2 characters.",
  "Full name must be 150 characters or fewer.",
  "Email must be a valid email address.",
  "Phone number is invalid.",
  "Please provide an email address or phone number.",
  "Preferred contact method is invalid.",
  "Consent is required before submitting the request.",
  "Policy document path is invalid.",
  "Request details must be a valid object.",
  "Request details must be valid JSON.",
  "Request details are too large.",
  "Request body is too large.",
  "Unable to submit insurance request.",
  "Unexpected server error.",
  "Invalid upload data.",
  "No file was provided.",
  "Invalid insurance category.",
  "The uploaded file is empty.",
  "Maximum file size is 10 MB.",
  "The uploaded file content does not match an allowed PDF, JPG or PNG document.",
  "Unable to upload policy document.",
  "Unexpected upload error.",
]);

class SafeApiError extends Error {}

export function createSafeApiError(
  serverMessage: unknown,
  fallback: string
) {
  const message =
    typeof serverMessage === "string" &&
    SAFE_API_ERROR_MESSAGES.has(serverMessage)
      ? serverMessage
      : fallback;

  return new SafeApiError(message);
}

export function getSafeApiErrorMessage(
  error: unknown,
  fallback: string
) {
  return error instanceof SafeApiError
    ? error.message
    : fallback;
}
