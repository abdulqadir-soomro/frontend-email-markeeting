import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, domainId, emailAddress } = await req.json();

    if (!userId || !domainId || !emailAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Get the domain document
    const domainRef = adminDb
      .collection("domains")
      .doc(userId)
      .collection("userDomains")
      .doc(domainId);

    const domainDoc = await domainRef.get();

    if (!domainDoc.exists) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    const domainData = domainDoc.data();
    const currentEmails = domainData?.emailAddresses || [];

    // Check if email already exists
    if (currentEmails.includes(emailAddress)) {
      return NextResponse.json(
        { error: "Email address already exists" },
        { status: 400 }
      );
    }

    // Add the email address
    await domainRef.update({
      emailAddresses: [...currentEmails, emailAddress],
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      emailAddress,
    });
  } catch (error: any) {
    console.error("Error adding email address:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

