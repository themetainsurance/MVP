import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  cleanupPolicyDocuments,
  PolicyDocumentCleanupError,
  type PolicyDocumentCleanupSummary,
  resolvePolicyOrphanGraceHours,
  resolvePolicyUploadTempGraceHours,
} from "../../../lib/policy-document-cleanup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMPTY_SUMMARY: PolicyDocumentCleanupSummary = {
  scanned: 0,
  linked: 0,
  protectedByGracePeriod: 0,
  deleted: 0,
  failed: 0,
  temporaryScanned: 0,
  temporaryDeleted: 0,
  temporaryFailed: 0,
  temporaryCleanupAvailable: true,
};

function errorResponse(
  error: string,
  status: number,
  summary?: PolicyDocumentCleanupSummary
) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(summary ?? {}),
    },
    { status }
  );
}

function hasValidAuthorization(
  authorizationHeader: string | null,
  cronSecret: string
) {
  const bearerPrefix = "Bearer ";

  if (
    !authorizationHeader?.startsWith(bearerPrefix) ||
    authorizationHeader.length <= bearerPrefix.length
  ) {
    return false;
  }

  const providedSecret = authorizationHeader.slice(
    bearerPrefix.length
  );
  const providedDigest = createHash("sha256")
    .update(providedSecret)
    .digest();
  const expectedDigest = createHash("sha256")
    .update(cronSecret)
    .digest();

  return timingSafeEqual(providedDigest, expectedDigest);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("Policy document cleanup failed.", {
      code: "server_configuration_missing",
      deleted: 0,
      failed: 0,
    });

    return errorResponse(
      "Service temporarily unavailable.",
      503
    );
  }

  if (
    !hasValidAuthorization(
      request.headers.get("authorization"),
      cronSecret
    )
  ) {
    return errorResponse("Unauthorized.", 401);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Policy document cleanup failed.", {
      code: "server_configuration_missing",
      deleted: 0,
      failed: 0,
    });

    return errorResponse(
      "Service temporarily unavailable.",
      503
    );
  }

  try {
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
    const summary = await cleanupPolicyDocuments(supabase, {
      graceHours: resolvePolicyOrphanGraceHours(
        process.env.POLICY_ORPHAN_GRACE_HOURS
      ),
      temporaryGraceHours: resolvePolicyUploadTempGraceHours(
        process.env.POLICY_UPLOAD_TEMP_GRACE_HOURS
      ),
    });

    console.info("Policy document cleanup completed.", {
      deleted: summary.deleted,
      failed: summary.failed,
      temporaryDeleted: summary.temporaryDeleted,
      temporaryFailed: summary.temporaryFailed,
    });

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    const cleanupError =
      error instanceof PolicyDocumentCleanupError
        ? error
        : null;
    const summary = cleanupError?.summary ?? EMPTY_SUMMARY;

    console.error("Policy document cleanup failed.", {
      code: cleanupError?.code ?? "unexpected_error",
      deleted: summary.deleted,
      failed: summary.failed,
      temporaryDeleted: summary.temporaryDeleted,
      temporaryFailed: summary.temporaryFailed,
    });

    return errorResponse(
      "Policy document cleanup could not be completed.",
      500,
      summary
    );
  }
}
