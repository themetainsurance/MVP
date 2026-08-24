import { NextResponse } from "next/server";
import { isSameOriginAdminRequest } from "../../../../lib/admin-api-auth";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function applyNoStoreHeaders(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return response;
}

export async function POST(request: Request) {
  if (!isSameOriginAdminRequest(request)) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 403 }
      )
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      console.error("Admin logout failed.", {
        code: "admin_logout_failed",
      });

      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, error: "Service temporarily unavailable." },
          { status: 503 }
        )
      );
    }

    return applyNoStoreHeaders(
      NextResponse.redirect(new URL("/admin/login", request.url), 303)
    );
  } catch {
    console.error("Admin logout failed.", {
      code: "admin_logout_unavailable",
    });

    return applyNoStoreHeaders(
      NextResponse.json(
        { success: false, error: "Service temporarily unavailable." },
        { status: 503 }
      )
    );
  }
}
