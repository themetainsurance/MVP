import "server-only";

import { getCurrentAdmin } from "./admin-auth";
import type { CurrentAdmin } from "./admin-types";

const STATE_CHANGING_METHODS = new Set([
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

export function isSameOriginAdminRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function authorizeAdminApiRequest(
  request: Request
): Promise<CurrentAdmin | null> {
  if (
    STATE_CHANGING_METHODS.has(request.method.toUpperCase()) &&
    !isSameOriginAdminRequest(request)
  ) {
    return null;
  }

  return getCurrentAdmin();
}
