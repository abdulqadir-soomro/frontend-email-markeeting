import { NextRequest, NextResponse } from "next/server";
import { deleteDomain } from "@/lib/aws-ses";
import { adminDb } from "@/lib/firebase-admin";

export async function DELETE(req: NextRequest) {
  try {
    const { domain, userId, domainId } = await req.json();

    if (!domain || !userId || !domainId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Delete from AWS SES
    await deleteDomain(domain);

    // Delete from Firestore
    await adminDb
      .collection("domains")
      .doc(userId)
      .collection("userDomains")
      .doc(domainId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting domain:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

