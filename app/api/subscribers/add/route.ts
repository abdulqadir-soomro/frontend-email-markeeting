import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, name } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existingSubscribers = await adminDb
      .collection("subscribers")
      .doc(userId)
      .collection("contacts")
      .where("email", "==", email)
      .get();

    if (!existingSubscribers.empty) {
      return NextResponse.json(
        { error: "Email already exists in your subscriber list" },
        { status: 400 }
      );
    }

    // Add subscriber
    const docRef = await adminDb
      .collection("subscribers")
      .doc(userId)
      .collection("contacts")
      .add({
        email,
        name: name || email.split("@")[0],
        status: "active",
        source: "manual",
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      subscriberId: docRef.id,
    });
  } catch (error: any) {
    console.error("Error adding subscriber:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

