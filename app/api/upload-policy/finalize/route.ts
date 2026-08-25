import { NextResponse } from "next/server";
import { isSameOriginRequest } from "../../../lib/request-security";
import { readPolicyUploadJsonBody } from "../../../lib/policy-upload-request";
import { finalizePolicyUpload } from "../../../lib/policy-upload-finalization";
import {
  createPolicyUploadFinalizationDependencies,
  policyUploadServerErrorCode,
} from "../../../lib/policy-upload-server";
import { createPrivilegedSupabaseClient } from "../../../lib/supabase/admin-server";
import { validateUploadFinalizationBody } from "../validation";

export const runtime = "nodejs";

function response(
  body: { success: boolean } & Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return response(
      { success: false, error: "Invalid upload data." },
      403
    );
  }

  const body = await readPolicyUploadJsonBody(request);
  if (body.success === false) {
    return response(
      { success: false, error: "Invalid upload data." },
      body.status
    );
  }

  const validation = validateUploadFinalizationBody(body.data);
  if (validation.success === false) {
    return response(
      { success: false, error: validation.error },
      400
    );
  }

  try {
    const supabase = createPrivilegedSupabaseClient();
    const result = await finalizePolicyUpload(
      validation.data.uploadSessionId,
      createPolicyUploadFinalizationDependencies(supabase)
    );

    if (result.status === "finalized") {
      return response({ success: true, path: result.path });
    }

    if (result.status === "expired") {
      return response(
        {
          success: false,
          error: "Upload expired. Please try again.",
        },
        410
      );
    }

    if (
      result.status === "invalid" ||
      result.status === "rejected"
    ) {
      console.warn("Policy upload validation failed.", {
        code: "policy_upload_validation_failed",
      });
      return response(
        {
          success: false,
          error: "The uploaded file could not be validated.",
        },
        400
      );
    }

    if (result.status === "busy") {
      return response(
        {
          success: false,
          error: "Document validation is already in progress.",
        },
        409
      );
    }

    if (result.status === "missing") {
      return response(
        { success: false, error: "Invalid upload data." },
        400
      );
    }

    return response(
      {
        success: false,
        error: "Document upload failed. Please try again.",
      },
      500
    );
  } catch (error) {
    const code = policyUploadServerErrorCode(error);
    console.error("Policy upload finalization failed.", {
      code: `policy_upload_finalize_${code}`,
    });
    return response(
      {
        success: false,
        error:
          code === "schema_unavailable" ||
          code === "configuration_unavailable"
            ? "Secure upload setup is temporarily unavailable."
            : "Document upload failed. Please try again.",
      },
      code === "schema_unavailable" ||
        code === "configuration_unavailable"
        ? 503
        : 500
    );
  }
}
