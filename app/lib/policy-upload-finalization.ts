import {
  detectFileType,
  MAX_FILE_SIZE_BYTES,
  type AllowedPolicyMimeType,
  type DetectedFileType,
  type UploadCategory,
} from "../api/upload-policy/validation";

export type ClaimedPolicyUploadSession = {
  id: string;
  category: UploadCategory;
  declaredMimeType: AllowedPolicyMimeType;
  declaredSize: number;
  temporaryPath: string;
  finalPath: string | null;
  detectedMimeType: AllowedPolicyMimeType | null;
  detectedSize: number | null;
  claimToken: string;
};

export type PolicyUploadClaimResult =
  | { outcome: "claimed"; session: ClaimedPolicyUploadSession }
  | { outcome: "finalized"; finalPath: string }
  | { outcome: "busy" | "expired" | "rejected" | "missing" };

export type PolicyUploadFinalizationDependencies = {
  claimSession: (
    uploadSessionId: string,
    now: Date
  ) => Promise<PolicyUploadClaimResult>;
  inspectObject: (path: string) => Promise<number | null>;
  downloadObject: (path: string) => Promise<Blob | null>;
  removeTemporaryObject: (path: string) => Promise<boolean>;
  reserveFinalPath: (
    session: ClaimedPolicyUploadSession,
    finalPath: string,
    fileType: DetectedFileType,
    detectedSize: number
  ) => Promise<boolean>;
  moveObject: (
    temporaryPath: string,
    finalPath: string
  ) => Promise<boolean>;
  completeSession: (
    session: ClaimedPolicyUploadSession,
    finalPath: string,
    fileType: DetectedFileType,
    detectedSize: number
  ) => Promise<boolean>;
  rejectSession: (
    session: ClaimedPolicyUploadSession,
    detectedMimeType: AllowedPolicyMimeType | null,
    detectedSize: number | null
  ) => Promise<boolean>;
  releaseClaim: (
    session: ClaimedPolicyUploadSession
  ) => Promise<void>;
  createRandomObjectId: () => string;
};

export type PolicyUploadFinalizationResult =
  | {
      status: "finalized";
      path: string;
      idempotent: boolean;
    }
  | {
      status:
        | "busy"
        | "expired"
        | "rejected"
        | "missing"
        | "invalid"
        | "failed";
    };

type StoredObjectValidation =
  | {
      status: "valid";
      fileType: DetectedFileType;
      size: number;
    }
  | {
      status: "invalid";
      detectedMimeType: AllowedPolicyMimeType | null;
      detectedSize: number | null;
    }
  | { status: "unavailable" };

function isSafeFinalPath(
  path: string,
  category: UploadCategory,
  extension: DetectedFileType["extension"]
) {
  return new RegExp(
    `^${category}/[0-9a-f]{32}\\.${extension}$`
  ).test(path);
}

function createFinalPath(
  category: UploadCategory,
  extension: DetectedFileType["extension"],
  createRandomObjectId: () => string
) {
  const randomObjectId = createRandomObjectId();
  if (!/^[0-9a-f]{32}$/.test(randomObjectId)) {
    throw new Error("Invalid server-generated policy object identifier.");
  }

  return `${category}/${randomObjectId}.${extension}`;
}

async function validateStoredObject(
  path: string,
  session: ClaimedPolicyUploadSession,
  dependencies: PolicyUploadFinalizationDependencies
): Promise<StoredObjectValidation> {
  const reportedSize = await dependencies.inspectObject(path);
  if (reportedSize === null) {
    return { status: "unavailable" };
  }

  const safeDetectedSize =
    Number.isSafeInteger(reportedSize) &&
    reportedSize > 0 &&
    reportedSize <= MAX_FILE_SIZE_BYTES
      ? reportedSize
      : null;

  if (
    safeDetectedSize === null ||
    safeDetectedSize !== session.declaredSize
  ) {
    return {
      status: "invalid",
      detectedMimeType: null,
      detectedSize: safeDetectedSize,
    };
  }

  const object = await dependencies.downloadObject(path);
  if (!object) {
    return { status: "unavailable" };
  }

  if (
    !Number.isSafeInteger(object.size) ||
    object.size !== reportedSize
  ) {
    return {
      status: "invalid",
      detectedMimeType: null,
      detectedSize:
        Number.isSafeInteger(object.size) &&
        object.size > 0 &&
        object.size <= MAX_FILE_SIZE_BYTES
          ? object.size
          : null,
    };
  }

  const bytes = new Uint8Array(await object.arrayBuffer());
  if (bytes.byteLength !== reportedSize) {
    return {
      status: "invalid",
      detectedMimeType: null,
      detectedSize:
        bytes.byteLength <= MAX_FILE_SIZE_BYTES
          ? bytes.byteLength
          : null,
    };
  }

  const fileType = detectFileType(bytes);
  if (
    !fileType ||
    fileType.mimeType !== session.declaredMimeType
  ) {
    return {
      status: "invalid",
      detectedMimeType: fileType?.mimeType ?? null,
      detectedSize: bytes.byteLength,
    };
  }

  return {
    status: "valid",
    fileType,
    size: bytes.byteLength,
  };
}

async function failAndRelease(
  session: ClaimedPolicyUploadSession,
  dependencies: PolicyUploadFinalizationDependencies
): Promise<PolicyUploadFinalizationResult> {
  await dependencies.releaseClaim(session);
  return { status: "failed" };
}

export async function finalizePolicyUpload(
  uploadSessionId: string,
  dependencies: PolicyUploadFinalizationDependencies,
  now = new Date()
): Promise<PolicyUploadFinalizationResult> {
  const claim = await dependencies.claimSession(
    uploadSessionId,
    now
  );

  if (claim.outcome === "finalized") {
    return {
      status: "finalized",
      path: claim.finalPath,
      idempotent: true,
    };
  }

  if (claim.outcome !== "claimed") {
    return { status: claim.outcome };
  }

  const { session } = claim;
  let validation = await validateStoredObject(
    session.temporaryPath,
    session,
    dependencies
  );
  let objectAlreadyMoved = false;

  if (
    validation.status === "unavailable" &&
    session.finalPath
  ) {
    validation = await validateStoredObject(
      session.finalPath,
      session,
      dependencies
    );
    objectAlreadyMoved = validation.status === "valid";
  }

  if (validation.status === "unavailable") {
    return failAndRelease(session, dependencies);
  }

  if (validation.status === "invalid") {
    await dependencies.removeTemporaryObject(
      session.temporaryPath
    );
    const rejected = await dependencies.rejectSession(
      session,
      validation.detectedMimeType,
      validation.detectedSize
    );
    if (!rejected) {
      return failAndRelease(session, dependencies);
    }
    return { status: "invalid" };
  }

  const { fileType, size } = validation;
  let finalPath = session.finalPath;

  if (finalPath) {
    if (
      !isSafeFinalPath(
        finalPath,
        session.category,
        fileType.extension
      ) ||
      (session.detectedMimeType !== null &&
        session.detectedMimeType !== fileType.mimeType) ||
      (session.detectedSize !== null &&
        session.detectedSize !== size)
    ) {
      return failAndRelease(session, dependencies);
    }
  } else {
    finalPath = createFinalPath(
      session.category,
      fileType.extension,
      dependencies.createRandomObjectId
    );
    const reserved = await dependencies.reserveFinalPath(
      session,
      finalPath,
      fileType,
      size
    );
    if (!reserved) {
      return failAndRelease(session, dependencies);
    }
  }

  if (!objectAlreadyMoved) {
    const moved = await dependencies.moveObject(
      session.temporaryPath,
      finalPath
    );

    if (!moved) {
      const destinationValidation = await validateStoredObject(
        finalPath,
        session,
        dependencies
      );
      if (destinationValidation.status !== "valid") {
        return failAndRelease(session, dependencies);
      }

      const removed = await dependencies.removeTemporaryObject(
        session.temporaryPath
      );
      if (!removed) {
        return failAndRelease(session, dependencies);
      }
    }
  }

  const completed = await dependencies.completeSession(
    session,
    finalPath,
    fileType,
    size
  );
  if (!completed) {
    return failAndRelease(session, dependencies);
  }

  return {
    status: "finalized",
    path: finalPath,
    idempotent: false,
  };
}
