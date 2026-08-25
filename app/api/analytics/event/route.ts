import { NextResponse } from "next/server";
import { storeAnalyticsEvent } from "../../../lib/analytics-server";
import {
  ANALYTICS_REQUEST_BODY_BYTES,
  isAnalyticsRequestBodyTooLarge,
  validateAnalyticsEvent,
} from "../../../lib/analytics-validation";
import { isSameOriginRequest } from "../../../lib/request-security";

export const runtime = "nodejs";

function invalidResponse(status = 400) {
  const response = NextResponse.json(
    { success: false, error: "Invalid analytics event." },
    { status }
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function successResponse() {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    console.warn("Analytics event rejected.", {
      code: "analytics_event_invalid",
    });
    return invalidResponse(403);
  }

  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    console.warn("Analytics event rejected.", {
      code: "analytics_event_invalid",
    });
    return invalidResponse();
  }

  const contentLengthValue = request.headers.get("content-length");
  if (contentLengthValue) {
    const contentLength = Number(contentLengthValue);
    if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
      console.warn("Analytics event rejected.", {
        code: "analytics_event_invalid",
      });
      return invalidResponse();
    }
    if (contentLength > ANALYTICS_REQUEST_BODY_BYTES) {
      console.warn("Analytics event rejected.", {
        code: "analytics_event_invalid",
      });
      return invalidResponse(413);
    }
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    console.warn("Analytics event rejected.", {
      code: "analytics_event_invalid",
    });
    return invalidResponse();
  }

  if (isAnalyticsRequestBodyTooLarge(rawBody)) {
    console.warn("Analytics event rejected.", {
      code: "analytics_event_invalid",
    });
    return invalidResponse(413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.warn("Analytics event rejected.", {
      code: "analytics_event_invalid",
    });
    return invalidResponse();
  }

  const validation = validateAnalyticsEvent(body);
  if (validation.success === false) {
    console.warn("Analytics event rejected.", {
      code: "analytics_event_invalid",
    });
    return invalidResponse();
  }

  try {
    const stored = await storeAnalyticsEvent(validation.data);
    if (!stored) {
      console.error("Analytics event storage failed.", {
        code: "analytics_event_store_failed",
      });
    }
  } catch {
    console.error("Analytics event storage failed.", {
      code: "analytics_event_store_failed",
    });
  }

  // Analytics is intentionally non-critical. Valid browser requests receive a
  // minimal success response even when storage is unavailable pre-migration.
  return successResponse();
}
