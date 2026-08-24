import { NextResponse } from "next/server";
import { isSameOriginAdminRequest } from "../../../../lib/admin-api-auth";
import { getActiveAdminByUserId } from "../../../../lib/admin-auth";
import { authorizeAdminLogin } from "../../../../lib/admin-auth-core";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LOGIN_BODY_BYTES = 8 * 1024;
const MAX_EMAIL_LENGTH = 320;
const MAX_PASSWORD_LENGTH = 1024;
const GENERIC_AUTH_ERROR =
  "Invalid credentials or access is not authorized.";
const SERVICE_ERROR = "Service temporarily unavailable.";

function noStoreJson(
  body: { success: boolean; error?: string },
  status: number
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

function isValidEmail(email: string) {
  return (
    email.length > 0 &&
    email.length <= MAX_EMAIL_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export async function POST(request: Request) {
  if (!isSameOriginAdminRequest(request)) {
    return noStoreJson({ success: false, error: GENERIC_AUTH_ERROR }, 401);
  }

  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    return noStoreJson(
      { success: false, error: "Invalid request data." },
      400
    );
  }

  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader
    ? Number(contentLengthHeader)
    : null;

  if (
    contentLength !== null &&
    Number.isFinite(contentLength) &&
    contentLength > MAX_LOGIN_BODY_BYTES
  ) {
    return noStoreJson(
      { success: false, error: "Invalid request data." },
      400
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return noStoreJson(
      { success: false, error: "Invalid request data." },
      400
    );
  }

  if (Buffer.byteLength(rawBody, "utf8") > MAX_LOGIN_BODY_BYTES) {
    return noStoreJson(
      { success: false, error: "Invalid request data." },
      400
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return noStoreJson(
      { success: false, error: "Invalid request data." },
      400
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return noStoreJson(
      { success: false, error: "Invalid request data." },
      400
    );
  }

  const emailValue = Reflect.get(body, "email");
  const password = Reflect.get(body, "password");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";

  if (
    !isValidEmail(email) ||
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return noStoreJson(
      { success: false, error: "Invalid request data." },
      400
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const result = await authorizeAdminLogin(email, password, {
      async signIn(loginEmail, loginPassword) {
        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });

        return error || !user ? null : user.id;
      },
      async verifyUser() {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        return error || !user ? null : user.id;
      },
      findAdmin: getActiveAdminByUserId,
      async clearSession() {
        await supabase.auth.signOut({ scope: "local" });
      },
    });

    if (result.status === "authorized") {
      return noStoreJson({ success: true }, 200);
    }

    if (result.status === "unavailable") {
      console.error("Admin login failed.", {
        code: "admin_login_unavailable",
      });

      return noStoreJson({ success: false, error: SERVICE_ERROR }, 503);
    }

    console.warn("Admin login failed.", {
      code: "admin_login_invalid_or_unauthorized",
    });

    return noStoreJson({ success: false, error: GENERIC_AUTH_ERROR }, 401);
  } catch {
    console.error("Admin login failed.", {
      code: "admin_login_unavailable",
    });

    return noStoreJson({ success: false, error: SERVICE_ERROR }, 503);
  }
}
