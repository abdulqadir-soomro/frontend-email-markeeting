import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    let totalUsers = 0;
    let totalCampaigns = 0;
    let totalEmailsSent = 0;
    let totalSubscribers = 0;
    let activeToday = 0;
    let campaignsSentToday = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get all users
    const usersSnapshot = await adminDb.collection("users").get();
    totalUsers = usersSnapshot.size;

    // Count users active today
    usersSnapshot.docs.forEach((doc) => {
      const lastActive = doc.data().lastActive;
      if (lastActive && new Date(lastActive) >= today) {
        activeToday++;
      }
    });

    // For each user, get their stats
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Get campaigns
      const campaignsSnapshot = await adminDb
        .collection("campaigns")
        .doc(userId)
        .collection("userCampaigns")
        .get();

      totalCampaigns += campaignsSnapshot.size;

      // Count emails sent and campaigns sent today
      campaignsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalEmailsSent += data.sentCount || 0;

        if (data.sentAt && new Date(data.sentAt) >= today) {
          campaignsSentToday++;
        }
      });

      // Get subscribers
      const subscribersSnapshot = await adminDb
        .collection("subscribers")
        .doc(userId)
        .collection("contacts")
        .get();

      totalSubscribers += subscribersSnapshot.size;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCampaigns,
        totalEmailsSent,
        totalSubscribers,
        activeToday,
        campaignsSentToday,
      },
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

