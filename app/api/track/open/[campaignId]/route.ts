import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldPath } from "firebase-admin/firestore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const email = req.nextUrl.searchParams.get("email");

    console.log(`📧 Tracking pixel hit - Campaign: ${campaignId}, Email: ${email}`);

    // Find campaign across all users (we need to search)
    // In a production app, you'd want to optimize this
    const campaignsSnapshot = await adminDb
      .collectionGroup("userCampaigns")
      .where(FieldPath.documentId(), "==", campaignId)
      .limit(1)
      .get();

    if (!campaignsSnapshot.empty) {
      const campaignDoc = campaignsSnapshot.docs[0];
      
      // Update emailRecords for this specific recipient
      if (email) {
        const emailRecordsSnapshot = await adminDb
          .collection("emailRecords")
          .where("campaignId", "==", campaignId)
          .where("recipientEmail", "==", email)
          .limit(1)
          .get();

        if (!emailRecordsSnapshot.empty) {
          const emailRecord = emailRecordsSnapshot.docs[0];
          const recordData = emailRecord.data();
          
          // Only update if not already marked as opened
          if (!recordData.opened) {
            console.log(`✅ Marking email as opened for ${email}`);
            await emailRecord.ref.update({
              opened: true,
              openedAt: new Date().toISOString(),
            });

            // Increment campaign open count
            await campaignDoc.ref.update({
              openCount: (campaignDoc.data().openCount || 0) + 1,
            });
          } else {
            console.log(`ℹ️ Email already marked as opened for ${email}`);
          }
        } else {
          console.log(`⚠️ No emailRecord found for campaign: ${campaignId}, email: ${email}`);
        }

        // Log the open event for detailed tracking
        const userId = campaignDoc.ref.parent.parent?.id;
        if (userId) {
          await adminDb
            .collection("campaigns")
            .doc(userId)
            .collection("userCampaigns")
            .doc(campaignId)
            .collection("opens")
            .add({
              email,
              timestamp: new Date().toISOString(),
              userAgent: req.headers.get("user-agent") || "",
              ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
            });
        }
      }
    }

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    return new NextResponse(pixel, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("Error tracking open:", error);
    
    // Still return pixel even on error
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    return new NextResponse(pixel, {
      headers: {
        "Content-Type": "image/gif",
      },
    });
  }
}

