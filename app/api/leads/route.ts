import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { snapshotLeadAttribution } from "../../lib/analytics-server";
import { isSameOriginRequest } from "../../lib/request-security";
import {
  isLeadRequestBodyTooLarge,
  MAX_REQUEST_BODY_BYTES,
  validateLeadBody,
} from "./validation";

export const runtime = "nodejs";

function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    {
      status,
    }
  );
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return errorResponse("Invalid request data.", 403);
    }

    const contentLengthHeader =
      request.headers.get("content-length");
    const contentLength = contentLengthHeader
      ? Number(contentLengthHeader)
      : null;

    if (
      contentLength !== null &&
      Number.isFinite(contentLength) &&
      contentLength > MAX_REQUEST_BODY_BYTES
    ) {
      return errorResponse(
        "Request body is too large.",
        413
      );
    }

    let rawBody: string;

    try {
      rawBody = await request.text();
    } catch {
      return errorResponse("Invalid request data.");
    }

    if (isLeadRequestBodyTooLarge(rawBody)) {
      return errorResponse(
        "Request body is too large.",
        413
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return errorResponse("Invalid request data.");
    }

    const validationResult = validateLeadBody(body);

    if (validationResult.success === false) {
      return errorResponse(validationResult.error);
    }

    const {
      analytics_session_id: analyticsSessionId,
      ...lead
    } = validationResult.data;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Lead API request failed.", {
        code: "server_configuration_missing",
      });

      return errorResponse(
        "Unexpected server error.",
        500
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    if (lead.policy_document_path) {
      const { data: uploadSession, error: uploadSessionError } =
        await supabase
          .from("policy_upload_sessions")
          .select("id")
          .eq("final_path", lead.policy_document_path)
          .eq("category", lead.insurance_type)
          .eq("status", "finalized")
          .maybeSingle();

      if (uploadSessionError) {
        console.error("Lead policy document validation failed.", {
          code: "policy_upload_session_validation_failed",
          insuranceType: lead.insurance_type,
        });
        return errorResponse(
          "Secure upload setup is temporarily unavailable.",
          503
        );
      }

      if (!uploadSession) {
        return errorResponse(
          "Policy document path is invalid."
        );
      }
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        ...lead,
        source: "website",
      })
      .select("id, created_at, status")
      .single();

    if (error) {
      const errorCode =
        typeof error.code === "string" &&
        /^[A-Za-z0-9_-]{1,32}$/.test(error.code)
          ? error.code
          : "unknown";

      console.error("Lead insert failed.", {
        code: errorCode,
        insuranceType: lead.insurance_type,
      });

      return errorResponse(
        "Unable to submit insurance request.",
        500
      );
    }

    if (analyticsSessionId) {
      try {
        await snapshotLeadAttribution(data.id, analyticsSessionId);
      } catch {
        console.error("Lead attribution storage failed.", {
          code: "lead_attribution_store_failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      lead: data,
    });
  } catch {
    console.error("Lead API request failed.", {
      code: "unexpected_error",
    });

    return errorResponse(
      "Unexpected server error.",
      500
    );
  }
}
