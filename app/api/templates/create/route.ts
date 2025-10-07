import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, name, subject, htmlContent, category } = await req.json();

    if (!userId || !name || !subject || !htmlContent) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const templateRef = await adminDb
      .collection("templates")
      .doc(userId)
      .collection("userTemplates")
      .add({
        name,
        subject,
        htmlContent,
        category: category || "marketing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      templateId: templateRef.id,
    });
  } catch (error: any) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

