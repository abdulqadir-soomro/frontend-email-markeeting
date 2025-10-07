import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const campaignId = searchParams.get("campaignId");

    if (!userId || !campaignId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get all active subscribers (who could have received the email)
    const subscribersSnapshot = await adminDb
      .collection("subscribers")
      .doc(userId)
      .collection("contacts")
      .where("status", "==", "active")
      .get();

    // Get email records for this campaign (tracking data)
    const emailRecordsSnapshot = await adminDb
      .collection("emailRecords")
      .where("campaignId", "==", campaignId)
      .get();

    // Create a map of email tracking data
    const trackingMap = new Map();
    emailRecordsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      trackingMap.set(data.recipientEmail, {
        sentAt: data.sentAt,
        openedAt: data.openedAt,
        opened: data.opened || false,
      });
    });

    // Build recipients list
    const recipients = subscribersSnapshot.docs.map((doc) => {
      const subscriber = doc.data();
      const tracking = trackingMap.get(subscriber.email);

      return {
        email: subscriber.email,
        name: subscriber.name || subscriber.email.split("@")[0],
        status: tracking ? "sent" : "active",
        sentAt: tracking?.sentAt || null,
        openedAt: tracking?.openedAt || null,
      };
    });

    // Filter to only show recipients who were actually sent the email
    const sentRecipients = recipients.filter((r) => r.status === "sent");

    return NextResponse.json({
      success: true,
      recipients: sentRecipients,
      total: sentRecipients.length,
    });
  } catch (error: any) {
    console.error("Error fetching campaign recipients:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

