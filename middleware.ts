import type { NextRequest } from "next/server";
import { refreshAdminAuthSession } from "./app/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return refreshAdminAuthSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
