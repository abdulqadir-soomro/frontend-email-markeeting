import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function PUT(req: NextRequest) {
  try {
    const { userId, subscriberId, name, status } = await req.json();

    if (!userId || !subscriberId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update subscriber
    await adminDb
      .collection("subscribers")
      .doc(userId)
      .collection("contacts")
      .doc(subscriberId)
      .update({
        name: name || "",
        status: status || "active",
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error updating subscriber:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

