import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/aws-ses";

export async function POST(req: NextRequest) {
  try {
    const { from, to, subject, htmlContent } = await req.json();

    if (!from || !to || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      from,
      to,
      subject,
      html: htmlContent,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error sending single email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

