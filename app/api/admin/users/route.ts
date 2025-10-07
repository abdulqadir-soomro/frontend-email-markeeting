import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Define admin emails
const ADMIN_EMAILS = [
  'admin@gmail.com',
  'abdulqadir53970@gmail.com',
];

export async function GET(req: NextRequest) {
  try {
    // Get the requesting user from headers or auth
    const authHeader = req.headers.get('authorization');
    // In production, verify the user's token and check if they're admin
    
    // For now, we'll fetch all users
    const usersSnapshot = await adminDb.collection("users").get();
    
    const users = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const userData = doc.data();
        const userId = doc.id;

        // Get campaign count
        const campaignsSnapshot = await adminDb
          .collection("campaigns")
          .doc(userId)
          .collection("userCampaigns")
          .get();

        // Get subscriber count
        const subscribersSnapshot = await adminDb
          .collection("subscribers")
          .doc(userId)
          .collection("contacts")
          .get();

        return {
          id: userId,
          email: userData.email || 'N/A',
          createdAt: userData.createdAt || new Date().toISOString(),
          campaignCount: campaignsSnapshot.size,
          subscriberCount: subscribersSnapshot.size,
          lastActive: userData.lastActive || userData.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: users.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

