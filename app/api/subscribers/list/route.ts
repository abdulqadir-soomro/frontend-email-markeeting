import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const subscribersSnapshot = await adminDb
      .collection("subscribers")
      .doc(userId)
      .collection("contacts")
      .orderBy("createdAt", "desc")
      .get();

    const subscribers = subscribersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ subscribers });
  } catch (error: any) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

