export const MAX_BLOG_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_BLOG_IMAGE_REQUEST_BYTES =
  MAX_BLOG_IMAGE_SIZE_BYTES + 256 * 1024;

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
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];

export type BlogImageType = {
  kind: "jpeg" | "png" | "webp";
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

export type BlogImageValidationResult =
  | { success: true; fileType: BlogImageType }
  | {
      success: false;
      reason: "empty" | "too_large" | "invalid_content";
    };

function bytesMatch(
  bytes: Uint8Array,
  signature: number[],
  offset = 0
) {
  if (bytes.byteLength < offset + signature.length) return false;
  return signature.every(
    (expected, index) => bytes[offset + index] === expected
  );
}

export function detectBlogImageType(
  bytes: Uint8Array
): BlogImageType | null {
  if (bytes.byteLength > JPEG_SIGNATURE.length && bytesMatch(bytes, JPEG_SIGNATURE)) {
    return { kind: "jpeg", mimeType: "image/jpeg", extension: "jpg" };
  }
  if (bytes.byteLength > PNG_SIGNATURE.length && bytesMatch(bytes, PNG_SIGNATURE)) {
    return { kind: "png", mimeType: "image/png", extension: "png" };
  }
  if (
    bytes.byteLength >= 12 &&
    bytesMatch(bytes, RIFF_SIGNATURE) &&
    bytesMatch(bytes, WEBP_SIGNATURE, 8)
  ) {
    return { kind: "webp", mimeType: "image/webp", extension: "webp" };
  }
  return null;
}

export function validateBlogImage(
  bytes: Uint8Array,
  submittedMimeType: string
): BlogImageValidationResult {
  if (bytes.byteLength === 0) {
    return { success: false, reason: "empty" };
  }
  if (bytes.byteLength > MAX_BLOG_IMAGE_SIZE_BYTES) {
    return { success: false, reason: "too_large" };
  }
  const fileType = detectBlogImageType(bytes);
  if (!fileType || fileType.mimeType !== submittedMimeType) {
    return { success: false, reason: "invalid_content" };
  }
  return { success: true, fileType };
}
