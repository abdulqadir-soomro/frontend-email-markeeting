import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendBulkEmails } from "@/lib/aws-ses";

export async function POST(req: NextRequest) {
  try {
    const { userId, subject, htmlContent, fromEmail, fromName } =
      await req.json();

    if (!userId || !subject || !htmlContent || !fromEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create campaign document
    const campaignRef = adminDb
      .collection("campaigns")
      .doc(userId)
      .collection("userCampaigns")
      .doc();

    await campaignRef.set({
      subject,
      htmlContent,
      fromEmail: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      status: "draft",
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      campaignId: campaignRef.id,
    });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

