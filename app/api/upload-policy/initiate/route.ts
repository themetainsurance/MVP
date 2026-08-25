import { NextResponse } from "next/server";
import { isSameOriginRequest } from "../../../lib/request-security";
import { readPolicyUploadJsonBody } from "../../../lib/policy-upload-request";
import {
  createPolicyUploadSession,
  policyUploadServerErrorCode,
} from "../../../lib/policy-upload-server";
import { createPrivilegedSupabaseClient } from "../../../lib/supabase/admin-server";
import { validateUploadInitiationBody } from "../validation";

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

  const validation = validateUploadInitiationBody(body.data);
  if (validation.success === false) {
    return response(
      { success: false, error: validation.error },
      400
    );
  }

  try {
    const session = await createPolicyUploadSession(
      createPrivilegedSupabaseClient(),
      validation.data
    );

    return response({
      success: true,
      upload_session_id: session.uploadSessionId,
      path: session.path,
      token: session.token,
    });
  } catch (error) {
    const code = policyUploadServerErrorCode(error);
    console.error("Policy upload initiation failed.", {
      code: `policy_upload_initiate_${code}`,
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
