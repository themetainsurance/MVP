import "server-only";

import {
  adminOperationFailed,
  adminServiceUnavailable,
} from "./admin-api-request";

function errorCode(value: unknown) {
  return value && typeof value === "object" && "code" in value
    ? String(value.code)
    : "";
}

export function comparisonApiFailure(error: unknown, operation: string) {
  const code = errorCode(error);
  return ["42P01", "42883", "PGRST202", "PGRST205"].includes(code)
    ? adminServiceUnavailable(`comparison_${operation}_schema_unavailable`)
    : error instanceof Error &&
        error.message === "Trusted comparison operation failed."
      ? adminOperationFailed(`comparison_${operation}_rejected`)
      : adminServiceUnavailable(`comparison_${operation}_unavailable`);
}
