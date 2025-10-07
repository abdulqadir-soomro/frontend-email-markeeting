import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, templateId } = await req.json();

    if (!userId || !templateId) {
      return NextResponse.json(
        { success: false, error: "Missing userId or templateId" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("templates")
      .doc(userId)
      .collection("userTemplates")
      .doc(templateId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

