import { NextRequest, NextResponse } from "next/server";
import { checkDomainStatus } from "@/lib/aws-ses";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { domain, userId, domainId } = await req.json();

    if (!domain || !userId || !domainId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check domain status with AWS SES
    const sesStatus = await checkDomainStatus(domain);

    if (!sesStatus.success) {
      return NextResponse.json(
        { error: sesStatus.error || "Failed to check domain status" },
        { status: 500 }
      );
    }

    // Update status in Firestore
    const status = sesStatus.verified ? "verified" : "pending";
    
    await adminDb
      .collection("domains")
      .doc(userId)
      .collection("userDomains")
      .doc(domainId)
      .update({
        status,
        dkimStatus: sesStatus.dkimStatus,
        lastChecked: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      verified: sesStatus.verified,
      status,
      dkimStatus: sesStatus.dkimStatus,
    });
  } catch (error: any) {
    console.error("Error verifying domain:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

