import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function DELETE(req: NextRequest) {
  try {
    const { userId, subscriberId } = await req.json();

    if (!userId || !subscriberId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("subscribers")
      .doc(userId)
      .collection("contacts")
      .doc(subscriberId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

