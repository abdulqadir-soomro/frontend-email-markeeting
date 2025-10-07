import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const credDoc = await adminDb
      .collection("gmailCredentials")
      .doc(userId)
      .get();

    if (!credDoc.exists) {
      return NextResponse.json({
        connected: false,
      });
    }

    const data = credDoc.data();

    return NextResponse.json({
      connected: data?.connected || false,
      email: data?.email || "",
      connectedAt: data?.connectedAt || "",
    });
  } catch (error: any) {
    console.error("Error checking Gmail status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

