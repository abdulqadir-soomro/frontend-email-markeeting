import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const campaigns: any[] = [];

    // Get all users first
    const usersSnapshot = await adminDb.collection("users").get();
    
    // For each user, get their campaigns
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userEmail = userDoc.data().email || 'Unknown';

      const campaignsSnapshot = await adminDb
        .collection("campaigns")
        .doc(userId)
        .collection("userCampaigns")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      campaignsSnapshot.docs.forEach((doc) => {
        campaigns.push({
          id: doc.id,
          userId,
          userEmail,
          ...doc.data(),
        });
      });
    }

    // Sort by creation date
    campaigns.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      campaigns: campaigns.slice(0, 100), // Limit to 100 most recent
    });
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

