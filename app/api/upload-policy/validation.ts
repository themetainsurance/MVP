export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const POLICY_UPLOAD_REQUEST_BODY_BYTES = 8 * 1024;
export const POLICY_UPLOAD_SESSION_MINUTES = 15;

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];
const PDF_EOF_MARKER = [0x25, 0x25, 0x45, 0x4f, 0x46];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a,
];
const PDF_EOF_SEARCH_BYTES = 4 * 1024;

export type UploadCategory = "motor" | "property";

export type AllowedPolicyMimeType =
  | "application/pdf"
  | "image/jpeg"
  | "image/png";

export type DetectedFileType = {
  kind: "pdf" | "jpeg" | "png";
  mimeType: AllowedPolicyMimeType;
  extension: "pdf" | "jpg" | "png";
};

export type UploadInitiationInput = {
  category: UploadCategory;
  mimeType: AllowedPolicyMimeType;
  size: number;
};

export type UploadFinalizationInput = {
  uploadSessionId: string;
};

type InputValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type FileValidationResult =
  | {
      success: true;
      fileType: DetectedFileType;
    }
  | {
      success: false;
      reason: "empty" | "too_large" | "invalid_content";
    };

function startsWithBytes(
  bytes: Uint8Array,
  signature: number[]
) {
  if (bytes.byteLength < signature.length) {
    return false;
  }

  return signature.every(
    (value, index) => bytes[index] === value
  );
}

function containsBytes(
  bytes: Uint8Array,
  sequence: number[],
  startIndex: number
) {
  const lastStartIndex =
    bytes.byteLength - sequence.length;

  for (
    let index = Math.max(0, startIndex);
    index <= lastStartIndex;
    index += 1
  ) {
    if (
      sequence.every(
        (value, offset) =>
          bytes[index + offset] === value
      )
    ) {
      return true;
    }
  }

  return false;
}

function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return (
    prototype === Object.prototype || prototype === null
  );
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: string[]
) {
  const actualKeys = Object.keys(value).sort();
  return (
    actualKeys.length === expectedKeys.length &&
    expectedKeys
      .slice()
      .sort()
      .every((key, index) => actualKeys[index] === key)
  );
}

export function validateUploadCategory(
  value: unknown
): UploadCategory | null {
  if (typeof value !== "string") {
    return null;
  }

  const category = value.trim().toLowerCase();

  if (category === "motor" || category === "property") {
    return category;
  }

  return null;
}

export function validateDeclaredPolicyMimeType(
  value: unknown
): AllowedPolicyMimeType | null {
  if (typeof value !== "string") {
    return null;
  }

  const mimeType = value.trim().toLowerCase();
  if (
    mimeType === "application/pdf" ||
    mimeType === "image/jpeg" ||
    mimeType === "image/png"
  ) {
    return mimeType;
  }

  return null;
}

export function validateUploadInitiationBody(
  value: unknown
): InputValidationResult<UploadInitiationInput> {
  if (
    !isPlainObject(value) ||
    !hasExactKeys(value, ["category", "mime_type", "size"])
  ) {
    return { success: false, error: "Invalid upload data." };
  }

  const category = validateUploadCategory(value.category);
  if (!category) {
    return {
      success: false,
      error: "Invalid insurance category.",
    };
  }

  const mimeType = validateDeclaredPolicyMimeType(
    value.mime_type
  );
  if (!mimeType) {
    return { success: false, error: "Unsupported file type." };
  }

  if (
    typeof value.size !== "number" ||
    !Number.isSafeInteger(value.size) ||
    value.size <= 0
  ) {
    return { success: false, error: "Invalid upload data." };
  }

  if (value.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: "The selected file is larger than 10 MB.",
    };
  }

  return {
    success: true,
    data: { category, mimeType, size: value.size },
  };
}

export function validateUploadFinalizationBody(
  value: unknown
): InputValidationResult<UploadFinalizationInput> {
  if (
    !isPlainObject(value) ||
    !hasExactKeys(value, ["upload_session_id"]) ||
    typeof value.upload_session_id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.upload_session_id
    )
  ) {
    return { success: false, error: "Invalid upload data." };
  }

  return {
    success: true,
    data: { uploadSessionId: value.upload_session_id },
  };
}

export function detectFileType(
  bytes: Uint8Array
): DetectedFileType | null {
  if (startsWithBytes(bytes, PDF_SIGNATURE)) {
    const eofSearchStart = Math.max(
      PDF_SIGNATURE.length,
      bytes.byteLength - PDF_EOF_SEARCH_BYTES
    );

    if (
      !containsBytes(
        bytes,
        PDF_EOF_MARKER,
        eofSearchStart
      )
    ) {
      return null;
    }

    return {
      kind: "pdf",
      mimeType: "application/pdf",
      extension: "pdf",
    };
  }

  if (
    bytes.byteLength > JPEG_SIGNATURE.length &&
    startsWithBytes(bytes, JPEG_SIGNATURE)
  ) {
    return {
      kind: "jpeg",
      mimeType: "image/jpeg",
      extension: "jpg",
    };
  }

  if (
    bytes.byteLength > PNG_SIGNATURE.length &&
    startsWithBytes(bytes, PNG_SIGNATURE)
  ) {
    return {
      kind: "png",
      mimeType: "image/png",
      extension: "png",
    };
  }

  return null;
}

export function validateUploadedFile(
  bytes: Uint8Array,
  submittedMimeType: string
): FileValidationResult {
  if (bytes.byteLength === 0) {
    return {
      success: false,
      reason: "empty",
    };
  }

  if (bytes.byteLength > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      reason: "too_large",
    };
  }

  const fileType = detectFileType(bytes);

  if (
    !fileType ||
    fileType.mimeType !== submittedMimeType
  ) {
    return {
      success: false,
      reason: "invalid_content",
    };
  }

  return {
    success: true,
    fileType,
  };
}
