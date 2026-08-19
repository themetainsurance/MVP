export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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

export type DetectedFileType = {
  kind: "pdf" | "jpeg" | "png";
  mimeType: "application/pdf" | "image/jpeg" | "image/png";
  extension: "pdf" | "jpg" | "png";
};

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
