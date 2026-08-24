import { NextResponse } from "next/server";
import { consumePublicReferralToken } from "../../lib/partner-referral-public";
import { isValidReferralToken } from "../../lib/partner-referral-token-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function unavailable() {
  return new NextResponse(
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"robots\" content=\"noindex,nofollow,noarchive\"><title>Partner link unavailable | The Meta Insurance</title></head><body style=\"margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif\"><main style=\"min-height:70vh;display:grid;place-items:center;padding:32px\"><section style=\"max-width:620px;text-align:center\"><h1>Partner link unavailable.</h1><p>This referral link is unavailable or has expired.</p><a href=\"/\">Return to The Meta Insurance</a></section></main></body></html>",
    { status: 404, headers: { ...PRIVATE_HEADERS, "Content-Type": "text/html; charset=utf-8" } }
  );
}
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!isValidReferralToken(token)) return unavailable();
  const destination = await consumePublicReferralToken(token);
  if (!destination) return unavailable();
  const response = NextResponse.redirect(destination, 302);
  for (const [name, value] of Object.entries(PRIVATE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}
