import { createHash, randomBytes } from "node:crypto";
import { isValidComparisonShareToken } from "./comparison-validation";

export function generateComparisonShareToken() {
  return randomBytes(32).toString("base64url");
}

export function hashComparisonShareToken(rawToken: string) {
  if (!isValidComparisonShareToken(rawToken)) {
    throw new Error("Invalid comparison share token.");
  }
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

