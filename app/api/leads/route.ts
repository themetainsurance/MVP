import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ALLOWED_INSURANCE_TYPES = [
  "travel",
  "motor",
  "property",
];

type LeadBody = {
  insurance_type?: string;

  full_name?: string;
  email?: string;
  phone?: string;
  preferred_contact?: string;

  policy_document_path?: string | null;

  consent?: boolean;

  details?: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration is missing.",
        },
        {
          status: 500,
        }
      );
    }

    let body: LeadBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data.",
        },
        {
          status: 400,
        }
      );
    }

    const insuranceType =
      body.insurance_type?.toLowerCase();

    if (
      !insuranceType ||
      !ALLOWED_INSURANCE_TYPES.includes(
        insuranceType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid insurance type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.full_name ||
      body.full_name.trim().length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.email &&
      !body.phone
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide an email address or phone number.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.consent !== true) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Consent is required before submitting the request.",
        },
        {
          status: 400,
        }
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

    const { data, error } = await supabase
      .from("leads")
      .insert({
        insurance_type: insuranceType,

        full_name:
          body.full_name?.trim() || null,

        email:
          body.email?.trim() || null,

        phone:
          body.phone?.trim() || null,

        preferred_contact:
          body.preferred_contact?.trim() ||
          null,

        policy_document_path:
          body.policy_document_path || null,

        consent: true,

        source: "website",

        details:
          body.details &&
          typeof body.details === "object"
            ? body.details
            : {},
      })
      .select("id, created_at, status")
      .single();

    if (error) {
      console.error(
        "Supabase lead insert error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to submit insurance request.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      lead: data,
    });
  } catch (error) {
    console.error(
      "Lead API unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}
