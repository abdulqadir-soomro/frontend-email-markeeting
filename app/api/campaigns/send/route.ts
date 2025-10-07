import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendBulkEmails } from "@/lib/aws-ses";

export async function POST(req: NextRequest) {
  try {
    const { userId, campaignId, sendingMethod = "aws" } = await req.json();

    if (!userId || !campaignId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get campaign details
    const campaignDoc = await adminDb
      .collection("campaigns")
      .doc(userId)
      .collection("userCampaigns")
      .doc(campaignId)
      .get();

    if (!campaignDoc.exists) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const campaign = campaignDoc.data();

    if (campaign?.status === "sent") {
      return NextResponse.json(
        { error: "Campaign already sent" },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const subscribersSnapshot = await adminDb
      .collection("subscribers")
      .doc(userId)
      .collection("contacts")
      .where("status", "==", "active")
      .get();

    const subscribers = subscribersSnapshot.docs.map((doc) => ({
      email: doc.data().email,
      name: doc.data().name || doc.data().email.split('@')[0],
    }));

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers found" },
        { status: 400 }
      );
    }

    let result;

    // Send emails based on method
    if (sendingMethod === "gmail") {
      // Gmail sending (max 500 per day)
      if (subscribers.length > 500) {
        return NextResponse.json(
          { error: "Gmail has a limit of 500 emails per day. Use AWS SES for larger campaigns." },
          { status: 400 }
        );
      }

      // Get Gmail credentials
      const gmailCreds = await adminDb.collection("gmailCredentials").doc(userId).get();
      if (!gmailCreds.exists || !gmailCreds.data()?.connected) {
        return NextResponse.json(
          { error: "Gmail not connected. Please connect Gmail in Settings first." },
          { status: 400 }
        );
      }

      // Send via Gmail
      let sent = 0;
      let failed = 0;

      for (const subscriber of subscribers) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gmail/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              to: subscriber.email,
              subject: campaign?.subject || "",
              htmlContent: campaign?.htmlContent || "",
              recipientName: subscriber.name,
              campaignId: campaignId,
            }),
          });

          const data = await response.json();
          if (data.success) {
            sent++;
            
            // Create email record for tracking
            await adminDb.collection("emailRecords").add({
              campaignId: campaignId,
              recipientEmail: subscriber.email,
              recipientName: subscriber.name,
              sentAt: new Date().toISOString(),
              opened: false,
              clicked: false,
              openedAt: null,
              clickedAt: null,
            });
          } else {
            failed++;
          }

          // Add delay to avoid rate limiting (Gmail allows ~1 email/second)
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          failed++;
        }
      }

      result = { sent, failed, total: subscribers.length };
    } else {
      // AWS SES sending
      const fromEmail = campaign?.fromEmail?.trim();
      
      if (!fromEmail) {
        return NextResponse.json(
          { error: "Campaign has no sender email address. Please update the campaign." },
          { status: 400 }
        );
      }

      const recipientEmails = subscribers.map(s => s.email);
      result = await sendBulkEmails({
        from: fromEmail,
        recipients: recipientEmails,
        subject: campaign?.subject || "",
        html: campaign?.htmlContent || "",
        campaignId: campaignId,
        batchSize: 50,
      });
    }

    // Update campaign status
    await campaignDoc.ref.update({
      status: "sent",
      sentCount: result.sent,
      sentAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    });
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

