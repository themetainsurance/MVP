import { NextResponse } from "next/server";
import { isSameOriginRequest } from "../../lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Invalid upload data." },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: "Secure direct policy upload is required.",
    },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
