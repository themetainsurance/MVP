import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const ALLOWED_CATEGORIES = ["motor", "property"];

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration is missing.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const categoryValue = formData.get("category");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file was provided.",
        },
        { status: 400 }
      );
    }

    const category =
      typeof categoryValue === "string"
        ? categoryValue.toLowerCase()
        : "motor";

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid insurance category.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF, JPG, JPEG and PNG files are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum file size is 10 MB.",
        },
        { status: 400 }
      );
    }

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

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "file";

    const safeExtension =
      extension === "jpeg"
        ? "jpg"
        : extension;

    const filePath =
      `${category}/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from("policy-documents")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to upload policy document.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
      path: filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected upload error.",
      },
      { status: 500 }
    );
  }
}
