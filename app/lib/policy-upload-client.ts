import { createClient } from "@supabase/supabase-js";
import {
  createSafeApiError,
} from "./safe-api-error";

export type PolicyUploadStage =
  | "preparing"
  | "uploading"
  | "validating"
  | "complete";

type PolicyUploadCategory = "motor" | "property";

type JsonResponse = {
  success?: unknown;
  error?: unknown;
  upload_session_id?: unknown;
  path?: unknown;
  token?: unknown;
};

export function policyUploadStageMessage(
  stage: PolicyUploadStage
) {
  switch (stage) {
    case "preparing":
      return "Preparing secure upload...";
    case "uploading":
      return "Uploading directly to private storage...";
    case "validating":
      return "Validating document...";
    case "complete":
      return "Upload complete.";
  }
}

async function readJsonResponse(response: Response) {
  try {
    const value: unknown = await response.json();
    return value && typeof value === "object"
      ? (value as JsonResponse)
      : null;
  } catch {
    return null;
  }
}

function responseError(
  result: JsonResponse | null,
  fallback: string
) {
  return createSafeApiError(result?.error, fallback);
}

export async function uploadPolicyDocumentDirectly({
  file,
  category,
  onStage,
}: {
  file: File;
  category: PolicyUploadCategory;
  onStage?: (stage: PolicyUploadStage) => void;
}) {
  onStage?.("preparing");
  const initiateResponse = await fetch(
    "/api/upload-policy/initiate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        category,
        mime_type: file.type,
        size: file.size,
      }),
    }
  );
  const initiation = await readJsonResponse(initiateResponse);

  if (
    !initiateResponse.ok ||
    initiation?.success !== true ||
    typeof initiation.upload_session_id !== "string" ||
    typeof initiation.path !== "string" ||
    typeof initiation.token !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      initiation.upload_session_id
    ) ||
    !new RegExp(
      `^_pending/${category}/[0-9a-f]{32}$`
    ).test(initiation.path) ||
    initiation.token.length < 20 ||
    initiation.token.length > 4096
  ) {
    throw responseError(
      initiation,
      "Document upload failed. Please try again."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw createSafeApiError(
      "Secure upload setup is temporarily unavailable.",
      "Document upload failed. Please try again."
    );
  }

  onStage?.("uploading");
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { data: uploaded, error: uploadError } =
    await supabase.storage
      .from("policy-documents")
      .uploadToSignedUrl(
        initiation.path,
        initiation.token,
        file,
        {
          contentType: file.type,
          upsert: false,
        }
      );

  if (uploadError || uploaded?.path !== initiation.path) {
    throw createSafeApiError(
      "Document upload failed. Please try again.",
      "Document upload failed. Please try again."
    );
  }

  onStage?.("validating");
  const finalizeResponse = await fetch(
    "/api/upload-policy/finalize",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        upload_session_id: initiation.upload_session_id,
      }),
    }
  );
  const finalization = await readJsonResponse(finalizeResponse);
  if (
    !finalizeResponse.ok ||
    finalization?.success !== true ||
    typeof finalization.path !== "string" ||
    !new RegExp(
      `^${category}/[0-9a-f]{32}\\.(?:pdf|jpg|png)$`
    ).test(finalization.path)
  ) {
    throw responseError(
      finalization,
      "Document upload failed. Please try again."
    );
  }

  onStage?.("complete");
  return finalization.path;
}
