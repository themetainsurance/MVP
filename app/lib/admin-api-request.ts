import "server-only";

import { NextResponse } from "next/server";
import { authorizeAdminApiRequest } from "./admin-api-auth";
import type { CurrentAdmin } from "./admin-types";

type AdminApiBody = Record<string, unknown>;

export function adminJsonResponse(
  body: { success: boolean; error?: string } & Record<string, unknown>,
  status = 200
) {
  const response = NextResponse.json(body, { status });
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export async function authorizeAdminOperation(request: Request): Promise<
  | { success: true; admin: CurrentAdmin }
  | { success: false; response: NextResponse }
> {
  const admin = await authorizeAdminApiRequest(request);
  if (!admin) {
    return {
      success: false,
      response: adminJsonResponse(
        { success: false, error: "Unauthorized." },
        401
      ),
    };
  }
  return { success: true, admin };
}

export async function readAdminJsonBody(
  request: Request,
  maxBytes: number
): Promise<
  | { success: true; data: AdminApiBody }
  | { success: false; response: NextResponse }
> {
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    return {
      success: false,
      response: adminJsonResponse(
        { success: false, error: "Invalid request." },
        400
      ),
    };
  }

  const contentLengthValue = request.headers.get("content-length");
  const contentLength = contentLengthValue ? Number(contentLengthValue) : null;
  if (
    contentLength !== null &&
    Number.isFinite(contentLength) &&
    contentLength > maxBytes
  ) {
    return {
      success: false,
      response: adminJsonResponse(
        { success: false, error: "Invalid request." },
        413
      ),
    };
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return {
      success: false,
      response: adminJsonResponse(
        { success: false, error: "Invalid request." },
        400
      ),
    };
  }

  if (Buffer.byteLength(rawBody, "utf8") > maxBytes) {
    return {
      success: false,
      response: adminJsonResponse(
        { success: false, error: "Invalid request." },
        413
      ),
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      success: false,
      response: adminJsonResponse(
        { success: false, error: "Invalid request." },
        400
      ),
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      success: false,
      response: adminJsonResponse(
        { success: false, error: "Invalid request." },
        400
      ),
    };
  }

  return { success: true, data: parsed as AdminApiBody };
}

export function adminOperationFailed(code: string) {
  console.error("Admin operation failed.", { code });
  return adminJsonResponse(
    { success: false, error: "Operation could not be completed." },
    409
  );
}

export function adminServiceUnavailable(code: string) {
  console.error("Admin operation unavailable.", { code });
  return adminJsonResponse(
    { success: false, error: "Service temporarily unavailable." },
    503
  );
}
