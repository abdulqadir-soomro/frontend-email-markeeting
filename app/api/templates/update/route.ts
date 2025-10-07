import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, templateId, name, subject, htmlContent, category } = await req.json();

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
      .update({
        name,
        subject,
        htmlContent,
        category,
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

