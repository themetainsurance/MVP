import {
  POLICY_UPLOAD_REQUEST_BODY_BYTES,
} from "../api/upload-policy/validation";

type JsonObject = Record<string, unknown>;

type BoundedBodyResult =
  | { success: true; rawBody: string }
  | { success: false; status: 400 | 413 };

export type PolicyUploadJsonBodyResult =
  | { success: true; data: JsonObject }
  | { success: false; status: 400 | 413 };

async function readBoundedBody(
  request: Request
): Promise<BoundedBodyResult> {
  if (!request.body) {
    return { success: true, rawBody: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > POLICY_UPLOAD_REQUEST_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { success: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { success: false, status: 400 };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      success: true,
      rawBody: new TextDecoder("utf-8", { fatal: true }).decode(
        bytes
      ),
    };
  } catch {
    return { success: false, status: 400 };
  }
}

export async function readPolicyUploadJsonBody(
  request: Request
): Promise<PolicyUploadJsonBodyResult> {
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    return { success: false, status: 400 };
  }

  const contentLengthValue = request.headers.get(
    "content-length"
  );
  const contentLength = contentLengthValue
    ? Number(contentLengthValue)
    : null;

  if (
    contentLength !== null &&
    (!Number.isSafeInteger(contentLength) ||
      contentLength < 0 ||
      contentLength > POLICY_UPLOAD_REQUEST_BODY_BYTES)
  ) {
    return { success: false, status: 413 };
  }

  const boundedBody = await readBoundedBody(request);
  if (boundedBody.success === false) return boundedBody;

  let data: unknown;
  try {
    data = JSON.parse(boundedBody.rawBody);
  } catch {
    return { success: false, status: 400 };
  }

  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data)
  ) {
    return { success: false, status: 400 };
  }

  return { success: true, data: data as JsonObject };
}
