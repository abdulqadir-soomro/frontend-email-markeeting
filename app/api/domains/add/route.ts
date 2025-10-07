import { NextRequest, NextResponse } from "next/server";
import { addDomain } from "@/lib/aws-ses";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { domain, userId } = await req.json();

    if (!domain || !userId) {
      return NextResponse.json(
        { error: "Missing domain or userId" },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Add domain to AWS SES
    const sesResult = await addDomain(domain);

    if (!sesResult.success) {
      return NextResponse.json(
        { error: sesResult.error || "Failed to add domain to SES" },
        { status: 500 }
      );
    }

    // Save domain to Firestore
    const domainRef = adminDb
      .collection("domains")
      .doc(userId)
      .collection("userDomains")
      .doc();

    await domainRef.set({
      domain,
      status: "pending",
      dkimTokens: sesResult.dkimTokens || [],
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      domain,
      dkimTokens: sesResult.dkimTokens || [],
      id: domainRef.id,
    });
  } catch (error: any) {
    console.error("Error adding domain:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

