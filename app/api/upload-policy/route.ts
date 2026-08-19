import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  MAX_FILE_SIZE_BYTES,
  validateUploadedFile,
  validateUploadCategory,
} from "./validation";

export const runtime = "nodejs";

const INVALID_FILE_CONTENT_ERROR =
  "The uploaded file content does not match an allowed PDF, JPG or PNG document.";

function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    {
      status,
    }
  );
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Policy upload request failed.", {
        code: "server_configuration_missing",
      });

      return errorResponse(
        "Unexpected upload error.",
        500
      );
    }

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return errorResponse("Invalid upload data.");
    }

    const file = formData.get("file");
    const categoryValue = formData.get("category");

    if (!(file instanceof File)) {
      return errorResponse("No file was provided.");
    }

    const category = validateUploadCategory(
      categoryValue
    );

    if (!category) {
      return errorResponse(
        "Invalid insurance category."
      );
    }

    if (file.size === 0) {
      return errorResponse(
        "The uploaded file is empty."
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse(
        "Maximum file size is 10 MB."
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileValidation = validateUploadedFile(
      buffer,
      file.type
    );

    if (fileValidation.success === false) {
      if (fileValidation.reason === "empty") {
        return errorResponse(
          "The uploaded file is empty."
        );
      }

      if (fileValidation.reason === "too_large") {
        return errorResponse(
          "Maximum file size is 10 MB."
        );
      }

      return errorResponse(INVALID_FILE_CONTENT_ERROR);
    }

    const detectedFileType = fileValidation.fileType;

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const filePath =
      `${category}/${Date.now()}-${crypto.randomUUID()}.${detectedFileType.extension}`;

    const { error } = await supabase.storage
      .from("policy-documents")
      .upload(filePath, buffer, {
        contentType: detectedFileType.mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Policy upload failed.", {
        code: "storage_upload_failed",
        category,
        detectedFileType: detectedFileType.kind,
      });

      return errorResponse(
        "Unable to upload policy document.",
        500
      );
    }

    return NextResponse.json({
      success: true,
      category,
      path: filePath,
    });
  } catch {
    console.error("Policy upload request failed.", {
      code: "unexpected_error",
    });

    return errorResponse(
      "Unexpected upload error.",
      500
    );
  }
}
