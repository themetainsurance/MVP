import { createHash, randomBytes } from "node:crypto";

const REFERRAL_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isValidReferralToken(value: unknown): value is string {
  return typeof value === "string" && REFERRAL_TOKEN_PATTERN.test(value);
}
export function generateReferralToken() {
  return randomBytes(32).toString("base64url");
}

export function hashReferralToken(rawToken: string) {
  if (!isValidReferralToken(rawToken)) {
    throw new Error("Invalid referral token.");
  }
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}
