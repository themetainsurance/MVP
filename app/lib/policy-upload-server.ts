import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  POLICY_UPLOAD_SESSION_MINUTES,
  validateDeclaredPolicyMimeType,
  validateUploadCategory,
  type UploadInitiationInput,
} from "../api/upload-policy/validation";
import type {
  ClaimedPolicyUploadSession,
  PolicyUploadClaimResult,
  PolicyUploadFinalizationDependencies,
} from "./policy-upload-finalization";

const POLICY_DOCUMENT_BUCKET = "policy-documents";
const MISSING_CAPABILITY_CODES = new Set([
  "42P01",
  "42883",
  "PGRST202",
  "PGRST205",
]);

type PolicyUploadServerErrorCode =
  | "configuration_unavailable"
  | "schema_unavailable"
  | "operation_failed";

type UploadSessionRpcRow = {
  outcome?: unknown;
  upload_session_id?: unknown;
  category?: unknown;
  declared_mime_type?: unknown;
  declared_size?: unknown;
  temporary_path?: unknown;
  final_path?: unknown;
  detected_mime_type?: unknown;
  detected_size?: unknown;
  claim_token?: unknown;
};

export class PolicyUploadServerError extends Error {
  readonly code: PolicyUploadServerErrorCode;

  constructor(code: PolicyUploadServerErrorCode) {
    super("Policy upload operation failed.");
    this.name = "PolicyUploadServerError";
    this.code = code;
  }
}

function databaseErrorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
}

function serverErrorFromDatabase(error: unknown) {
  return new PolicyUploadServerError(
    MISSING_CAPABILITY_CODES.has(databaseErrorCode(error))
      ? "schema_unavailable"
      : "operation_failed"
  );
}

function createRandomObjectId() {
  return crypto.randomUUID().replaceAll("-", "");
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function numberFromDatabase(value: unknown) {
  const numberValue =
    typeof value === "number" || typeof value === "string"
      ? Number(value)
      : Number.NaN;
  return Number.isSafeInteger(numberValue) ? numberValue : null;
}

function singleRpcRow(data: unknown) {
  if (Array.isArray(data)) {
    return (data[0] ?? null) as UploadSessionRpcRow | null;
  }
  return data && typeof data === "object"
    ? (data as UploadSessionRpcRow)
    : null;
}

function nullableString(value: unknown) {
  return value === null
    ? null
    : typeof value === "string"
    ? value
    : undefined;
}

function parseClaimedSession(
  row: UploadSessionRpcRow
): ClaimedPolicyUploadSession | null {
  const finalPath = nullableString(row.final_path);
  const category = validateUploadCategory(row.category);
  const declaredMimeType = validateDeclaredPolicyMimeType(
    row.declared_mime_type
  );
  const declaredSize = numberFromDatabase(row.declared_size);
  const detectedMimeType =
    row.detected_mime_type === null
      ? null
      : validateDeclaredPolicyMimeType(row.detected_mime_type);
  const detectedSize =
    row.detected_size === null
      ? null
      : numberFromDatabase(row.detected_size);

  if (
    !isUuid(row.upload_session_id) ||
    !isUuid(row.claim_token) ||
    !category ||
    !declaredMimeType ||
    declaredSize === null ||
    typeof row.temporary_path !== "string" ||
    !/^_pending\/(?:motor|property)\/[0-9a-f]{32}$/.test(
      row.temporary_path
    ) ||
    !row.temporary_path.startsWith(`_pending/${category}/`) ||
    finalPath === undefined ||
    (row.detected_mime_type !== null && !detectedMimeType) ||
    (row.detected_size !== null && detectedSize === null)
  ) {
    return null;
  }

  return {
    id: row.upload_session_id,
    category,
    declaredMimeType,
    declaredSize,
    temporaryPath: row.temporary_path,
    finalPath,
    detectedMimeType,
    detectedSize,
    claimToken: row.claim_token,
  };
}

function isSafeFinalizedPath(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^(?:motor|property)\/[0-9a-f]{32}\.(?:pdf|jpg|png)$/.test(
      value
    )
  );
}

export async function createPolicyUploadSession(
  supabase: SupabaseClient,
  input: UploadInitiationInput,
  now = new Date()
) {
  const temporaryPath = `_pending/${input.category}/${createRandomObjectId()}`;
  const expiresAt = new Date(
    now.getTime() + POLICY_UPLOAD_SESSION_MINUTES * 60 * 1000
  );

  const { data: session, error: sessionError } = await supabase
    .from("policy_upload_sessions")
    .insert({
      category: input.category,
      declared_mime_type: input.mimeType,
      declared_size: input.size,
      temporary_path: temporaryPath,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (sessionError || !isUuid(session?.id)) {
    throw serverErrorFromDatabase(sessionError);
  }

  const { data: authorization, error: authorizationError } =
    await supabase.storage
      .from(POLICY_DOCUMENT_BUCKET)
      .createSignedUploadUrl(temporaryPath, {
        upsert: false,
      });

  if (
    authorizationError ||
    !authorization ||
    authorization.path !== temporaryPath ||
    typeof authorization.token !== "string" ||
    authorization.token.length < 20 ||
    authorization.token.length > 4096
  ) {
    await supabase
      .from("policy_upload_sessions")
      .update({ status: "rejected" })
      .eq("id", session.id)
      .eq("status", "pending");
    throw new PolicyUploadServerError("operation_failed");
  }

  return {
    uploadSessionId: session.id,
    path: temporaryPath,
    token: authorization.token,
  };
}

export function createPolicyUploadFinalizationDependencies(
  supabase: SupabaseClient
): PolicyUploadFinalizationDependencies {
  const bucket = supabase.storage.from(POLICY_DOCUMENT_BUCKET);

  return {
    async claimSession(uploadSessionId, now) {
      const { data, error } = await supabase.rpc(
        "claim_policy_upload_session",
        {
          p_session_id: uploadSessionId,
          p_now: now.toISOString(),
        }
      );
      if (error) {
        throw serverErrorFromDatabase(error);
      }

      const row = singleRpcRow(data);
      const outcome = row?.outcome;
      if (
        outcome === "busy" ||
        outcome === "expired" ||
        outcome === "rejected" ||
        outcome === "missing"
      ) {
        return { outcome } satisfies PolicyUploadClaimResult;
      }

      if (outcome === "finalized") {
        const category = validateUploadCategory(row?.category);
        if (
          !category ||
          !isSafeFinalizedPath(row?.final_path) ||
          !row.final_path.startsWith(`${category}/`)
        ) {
          throw new PolicyUploadServerError("operation_failed");
        }
        return {
          outcome,
          finalPath: row.final_path,
        } satisfies PolicyUploadClaimResult;
      }

      if (outcome === "claimed" && row) {
        const session = parseClaimedSession(row);
        if (session) {
          return {
            outcome,
            session,
          } satisfies PolicyUploadClaimResult;
        }
      }

      throw new PolicyUploadServerError("operation_failed");
    },

    async inspectObject(path) {
      const { data, error } = await bucket.info(path);
      if (error || !data) return null;
      const size = data.size ?? data.metadata?.size;
      return Number.isSafeInteger(size) && Number(size) >= 0
        ? Number(size)
        : null;
    },

    async downloadObject(path) {
      const { data, error } = await bucket.download(
        path,
        {},
        { cache: "no-store" }
      );
      return error || !data ? null : data;
    },

    async removeTemporaryObject(path) {
      const { error } = await bucket.remove([path]);
      return !error;
    },

    async reserveFinalPath(
      session,
      finalPath,
      fileType,
      detectedSize
    ) {
      const { data, error } = await supabase.rpc(
        "reserve_policy_upload_destination",
        {
          p_session_id: session.id,
          p_claim_token: session.claimToken,
          p_final_path: finalPath,
          p_detected_mime_type: fileType.mimeType,
          p_detected_size: detectedSize,
        }
      );
      if (error) throw serverErrorFromDatabase(error);
      return data === true;
    },

    async moveObject(temporaryPath, finalPath) {
      const { error } = await bucket.move(
        temporaryPath,
        finalPath
      );
      return !error;
    },

    async completeSession(
      session,
      finalPath,
      fileType,
      detectedSize
    ) {
      const { data, error } = await supabase.rpc(
        "complete_policy_upload_session",
        {
          p_session_id: session.id,
          p_claim_token: session.claimToken,
          p_final_path: finalPath,
          p_detected_mime_type: fileType.mimeType,
          p_detected_size: detectedSize,
        }
      );
      if (error) throw serverErrorFromDatabase(error);
      return data === true;
    },

    async rejectSession(
      session,
      detectedMimeType,
      detectedSize
    ) {
      const { data, error } = await supabase.rpc(
        "reject_policy_upload_session",
        {
          p_session_id: session.id,
          p_claim_token: session.claimToken,
          p_detected_mime_type: detectedMimeType,
          p_detected_size: detectedSize,
        }
      );
      if (error) throw serverErrorFromDatabase(error);
      return data === true;
    },

    async releaseClaim(session) {
      const { error } = await supabase.rpc(
        "release_policy_upload_claim",
        {
          p_session_id: session.id,
          p_claim_token: session.claimToken,
        }
      );
      if (error) throw serverErrorFromDatabase(error);
    },

    createRandomObjectId,
  };
}

export function policyUploadServerErrorCode(error: unknown) {
  if (error instanceof PolicyUploadServerError) {
    return error.code;
  }

  return error instanceof Error &&
    error.message ===
      "Privileged Supabase configuration is unavailable."
    ? "configuration_unavailable"
    : "operation_failed";
}
