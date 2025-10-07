import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, appPassword } = await req.json();

    if (!userId || !email || !appPassword) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email is Gmail
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json(
        { success: false, error: "Only Gmail addresses are supported" },
        { status: 400 }
      );
    }

    // Validate app password format (16 characters)
    const cleanPassword = appPassword.replace(/\s/g, '');
    if (cleanPassword.length !== 16) {
      return NextResponse.json(
        { success: false, error: "App password must be 16 characters" },
        { status: 400 }
      );
    }

    // Store credentials (encrypted in production!)
    await adminDb
      .collection("gmailCredentials")
      .doc(userId)
      .set({
        email,
        appPassword: cleanPassword, // In production, encrypt this!
        connected: true,
        connectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: "Gmail connected successfully",
    });
  } catch (error: any) {
    console.error("Error connecting Gmail:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

