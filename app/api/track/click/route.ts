import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldPath } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  try {
    const campaignId = req.nextUrl.searchParams.get("campaignId");
    const url = req.nextUrl.searchParams.get("url");
    const email = req.nextUrl.searchParams.get("email");

    if (!url) {
      return NextResponse.json(
        { error: "Missing URL parameter" },
        { status: 400 }
      );
    }

    if (campaignId) {
      // Find campaign and increment click count
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
            
            // Only update if not already marked as clicked
            if (!recordData.clicked) {
              await emailRecord.ref.update({
                clicked: true,
                clickedAt: new Date().toISOString(),
              });

              // Increment campaign click count
              await campaignDoc.ref.update({
                clickCount: (campaignDoc.data().clickCount || 0) + 1,
              });
            }
          }

          // Log the click event for detailed tracking
          const userId = campaignDoc.ref.parent.parent?.id;
          if (userId) {
            await adminDb
              .collection("campaigns")
              .doc(userId)
              .collection("userCampaigns")
              .doc(campaignId)
              .collection("clicks")
              .add({
                email,
                url,
                timestamp: new Date().toISOString(),
                userAgent: req.headers.get("user-agent") || "",
                ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
              });
          }
        }
      }
    }

    // Redirect to original URL
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error("Error tracking click:", error);
    
    // Redirect anyway
    const url = req.nextUrl.searchParams.get("url");
    if (url) {
      return NextResponse.redirect(url);
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

