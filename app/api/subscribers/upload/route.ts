import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { parse } from "csv-parse/sync";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Process each record
    const batch = adminDb.batch();
    const subscribersRef = adminDb
      .collection("subscribers")
      .doc(userId)
      .collection("contacts");

    for (const record of records) {
      try {
        const email = record.email || record.Email || record.EMAIL;
        const name = record.name || record.Name || record.NAME || "";

        if (!email) {
          failCount++;
          errors.push("Row missing email address");
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          failCount++;
          errors.push(`Invalid email format: ${email}`);
          continue;
        }

        // Check if subscriber already exists
        const existingSubscriber = await subscribersRef
          .where("email", "==", email)
          .limit(1)
          .get();

        if (!existingSubscriber.empty) {
          failCount++;
          errors.push(`Email already exists: ${email}`);
          continue;
        }

        // Add to batch
        const newSubscriberRef = subscribersRef.doc();
        batch.set(newSubscriberRef, {
          email,
          name,
          status: "active",
          createdAt: new Date().toISOString(),
        });

        successCount++;
      } catch (error: any) {
        failCount++;
        errors.push(error.message);
      }
    }

    // Commit batch
    await batch.commit();

    return NextResponse.json({
      success: true,
      added: successCount,
      failed: failCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error: any) {
    console.error("Error uploading subscribers:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

