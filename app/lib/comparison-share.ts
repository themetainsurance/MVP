import "server-only";

import type { AdminRpcClient } from "./admin-dashboard-actions";
import { buildCustomerComparisonSnapshot } from "./comparison-share-snapshot";
import {
  generateComparisonShareToken,
  hashComparisonShareToken,
} from "./comparison-token-core";
import type { PolicyComparison, PolicyComparisonOption } from "./comparison-types";

export async function createAdminComparisonShare(
  client: AdminRpcClient,
  comparison: PolicyComparison,
  options: readonly PolicyComparisonOption[],
  expiryDays: number,
  actorId: string
) {
  const rawToken = generateComparisonShareToken();
  const tokenHash = hashComparisonShareToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + expiryDays);
  const snapshot = buildCustomerComparisonSnapshot(
    comparison,
    options,
    now.toISOString()
  );
  const { data, error } = await client.rpc("create_policy_comparison_share", {
    p_comparison_id: comparison.id,
    p_token_hash: tokenHash,
    p_expires_at: expiresAt.toISOString(),
    p_source_version: comparison.version,
    p_snapshot: snapshot,
    p_actor_id: actorId,
  });
  if (error) throw new Error("Trusted comparison operation failed.");
  return { shareId: data, rawToken, expiresAt: expiresAt.toISOString() };
}
