import type { SupabaseClient } from "@supabase/supabase-js";

const POLICY_DOCUMENT_BUCKET = "policy-documents";
const POLICY_DOCUMENT_PREFIXES = ["motor", "property"] as const;
const LINKED_PATH_PAGE_SIZE = 1000;
const STORAGE_LIST_PAGE_SIZE = 100;
const STORAGE_REMOVE_BATCH_SIZE = 100;

export const DEFAULT_POLICY_ORPHAN_GRACE_HOURS = 24;

export type PolicyDocumentCleanupSummary = {
  scanned: number;
  linked: number;
  protectedByGracePeriod: number;
  deleted: number;
  failed: number;
};

type PolicyDocumentCleanupErrorCode =
  | "cleanup_configuration_invalid"
  | "linked_paths_load_failed"
  | "storage_list_failed"
  | "storage_remove_failed";

type LinkedPathRow = {
  policy_document_path: string | null;
};

type ListedStorageObject = {
  prefix: (typeof POLICY_DOCUMENT_PREFIXES)[number];
  name: string;
  createdAt: string | null;
};

type CleanupOptions = {
  graceHours?: number;
  now?: Date;
};

export class PolicyDocumentCleanupError extends Error {
  readonly code: PolicyDocumentCleanupErrorCode;
  readonly summary: PolicyDocumentCleanupSummary;

  constructor(
    code: PolicyDocumentCleanupErrorCode,
    summary: PolicyDocumentCleanupSummary
  ) {
    super("Policy document cleanup could not be completed.");
    this.name = "PolicyDocumentCleanupError";
    this.code = code;
    this.summary = { ...summary };
  }
}

function createSummary(): PolicyDocumentCleanupSummary {
  return {
    scanned: 0,
    linked: 0,
    protectedByGracePeriod: 0,
    deleted: 0,
    failed: 0,
  };
}

export function resolvePolicyOrphanGraceHours(
  configuredValue: string | undefined
) {
  if (configuredValue === undefined) {
    return DEFAULT_POLICY_ORPHAN_GRACE_HOURS;
  }

  const normalizedValue = configuredValue.trim();

  if (!/^\d+$/.test(normalizedValue)) {
    return DEFAULT_POLICY_ORPHAN_GRACE_HOURS;
  }

  const parsedValue = Number(normalizedValue);

  if (
    !Number.isSafeInteger(parsedValue) ||
    parsedValue < 1 ||
    parsedValue > 168
  ) {
    return DEFAULT_POLICY_ORPHAN_GRACE_HOURS;
  }

  return parsedValue;
}

async function loadLinkedPolicyPaths(
  supabase: SupabaseClient,
  summary: PolicyDocumentCleanupSummary
) {
  const linkedPaths = new Set<string>();
  let offset = 0;

  while (true) {
    let result;

    try {
      result = await supabase
        .from("leads")
        .select("policy_document_path")
        .not("policy_document_path", "is", null)
        .order("id", { ascending: true })
        .range(offset, offset + LINKED_PATH_PAGE_SIZE - 1);
    } catch {
      throw new PolicyDocumentCleanupError(
        "linked_paths_load_failed",
        summary
      );
    }

    if (result.error || !Array.isArray(result.data)) {
      throw new PolicyDocumentCleanupError(
        "linked_paths_load_failed",
        summary
      );
    }

    const rows = result.data as LinkedPathRow[];

    for (const row of rows) {
      const path = row?.policy_document_path;

      if (path === null) {
        continue;
      }

      if (typeof path !== "string") {
        throw new PolicyDocumentCleanupError(
          "linked_paths_load_failed",
          summary
        );
      }

      linkedPaths.add(path);
    }

    if (rows.length < LINKED_PATH_PAGE_SIZE) {
      break;
    }

    offset += rows.length;
  }

  return linkedPaths;
}

async function listPolicyDocuments(
  supabase: SupabaseClient,
  summary: PolicyDocumentCleanupSummary
) {
  const listedObjects: ListedStorageObject[] = [];
  const bucket = supabase.storage.from(POLICY_DOCUMENT_BUCKET);

  for (const prefix of POLICY_DOCUMENT_PREFIXES) {
    let offset = 0;

    while (true) {
      let result;

      try {
        result = await bucket.list(prefix, {
          limit: STORAGE_LIST_PAGE_SIZE,
          offset,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });
      } catch {
        throw new PolicyDocumentCleanupError(
          "storage_list_failed",
          summary
        );
      }

      if (result.error || !Array.isArray(result.data)) {
        throw new PolicyDocumentCleanupError(
          "storage_list_failed",
          summary
        );
      }

      for (const item of result.data) {
        if (
          !item ||
          typeof item.name !== "string" ||
          !(typeof item.id === "string" || item.id === null)
        ) {
          throw new PolicyDocumentCleanupError(
            "storage_list_failed",
            summary
          );
        }

        // Supabase returns folders with a null id. Only direct file objects
        // under the approved prefixes are cleanup candidates.
        if (item.id === null) {
          continue;
        }

        listedObjects.push({
          prefix,
          name: item.name,
          createdAt:
            typeof item.created_at === "string"
              ? item.created_at
              : null,
        });
      }

      if (result.data.length < STORAGE_LIST_PAGE_SIZE) {
        break;
      }

      offset += result.data.length;
    }
  }

  return listedObjects;
}

async function removePolicyDocuments(
  supabase: SupabaseClient,
  paths: string[],
  summary: PolicyDocumentCleanupSummary
) {
  const bucket = supabase.storage.from(POLICY_DOCUMENT_BUCKET);

  for (
    let index = 0;
    index < paths.length;
    index += STORAGE_REMOVE_BATCH_SIZE
  ) {
    const batch = paths.slice(
      index,
      index + STORAGE_REMOVE_BATCH_SIZE
    );

    let result;

    try {
      result = await bucket.remove(batch);
    } catch {
      summary.failed += batch.length;
      throw new PolicyDocumentCleanupError(
        "storage_remove_failed",
        summary
      );
    }

    if (result.error || !Array.isArray(result.data)) {
      summary.failed += batch.length;
      throw new PolicyDocumentCleanupError(
        "storage_remove_failed",
        summary
      );
    }

    const removedCount = Math.min(
      result.data.length,
      batch.length
    );

    summary.deleted += removedCount;

    if (removedCount !== batch.length) {
      summary.failed += batch.length - removedCount;
      throw new PolicyDocumentCleanupError(
        "storage_remove_failed",
        summary
      );
    }
  }
}

export async function cleanupPolicyDocuments(
  supabase: SupabaseClient,
  options: CleanupOptions = {}
): Promise<PolicyDocumentCleanupSummary> {
  const summary = createSummary();
  const graceHours =
    options.graceHours ?? DEFAULT_POLICY_ORPHAN_GRACE_HOURS;
  const now = options.now ?? new Date();
  const nowTimestamp = now.getTime();

  if (
    !Number.isSafeInteger(graceHours) ||
    graceHours < 1 ||
    graceHours > 168 ||
    !Number.isFinite(nowTimestamp)
  ) {
    throw new PolicyDocumentCleanupError(
      "cleanup_configuration_invalid",
      summary
    );
  }

  // Load references before listing, then refresh them after listing. Keeping
  // the union protects both existing references and links created mid-scan.
  const linkedPaths = await loadLinkedPolicyPaths(
    supabase,
    summary
  );
  const listedObjects = await listPolicyDocuments(
    supabase,
    summary
  );
  const refreshedLinkedPaths = await loadLinkedPolicyPaths(
    supabase,
    summary
  );

  for (const path of refreshedLinkedPaths) {
    linkedPaths.add(path);
  }

  const graceCutoff =
    nowTimestamp - graceHours * 60 * 60 * 1000;
  const candidatePaths: string[] = [];
  const seenPaths = new Set<string>();

  for (const object of listedObjects) {
    summary.scanned += 1;

    if (
      !object.name ||
      object.name === "." ||
      object.name === ".." ||
      object.name.includes("/") ||
      object.name.includes("\\")
    ) {
      summary.failed += 1;
      continue;
    }

    const path = `${object.prefix}/${object.name}`;

    if (seenPaths.has(path)) {
      continue;
    }

    seenPaths.add(path);

    if (linkedPaths.has(path)) {
      summary.linked += 1;
      continue;
    }

    const createdAtTimestamp = object.createdAt
      ? Date.parse(object.createdAt)
      : Number.NaN;

    if (!Number.isFinite(createdAtTimestamp)) {
      summary.failed += 1;
      continue;
    }

    if (createdAtTimestamp >= graceCutoff) {
      summary.protectedByGracePeriod += 1;
      continue;
    }

    candidatePaths.push(path);
  }

  await removePolicyDocuments(
    supabase,
    candidatePaths,
    summary
  );

  return summary;
}
