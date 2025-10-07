import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("gmailCredentials")
      .doc(userId)
      .delete();

    return NextResponse.json({
      success: true,
      message: "Gmail disconnected successfully",
    });
  } catch (error: any) {
    console.error("Error disconnecting Gmail:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

