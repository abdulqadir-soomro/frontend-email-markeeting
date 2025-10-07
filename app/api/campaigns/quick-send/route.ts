import { NextRequest, NextResponse } from "next/server";
import { sendBulkEmails } from "@/lib/aws-ses";

export async function POST(req: NextRequest) {
  try {
    const { userId, recipients, subject, htmlContent, fromEmail, sendingMethod = "aws" } = await req.json();

    if (!userId || !recipients || !subject || !htmlContent || !fromEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Recipients array is required" },
        { status: 400 }
      );
    }

    let result;

    // Send emails based on method
    if (sendingMethod === "gmail") {
      // Gmail sending (max 500 per day)
      if (recipients.length > 500) {
        return NextResponse.json(
          { error: "Gmail has a limit of 500 emails per day. Use AWS SES for larger campaigns." },
          { status: 400 }
        );
      }

      // Send via Gmail
      let sent = 0;
      let failed = 0;

      for (const recipient of recipients) {
        try {
          // Personalize content
          const personalizedContent = htmlContent.replace(/{{\s*name\s*}}/g, recipient.name || recipient.email.split("@")[0]);

          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gmail/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              to: recipient.email,
              subject,
              htmlContent: personalizedContent,
              recipientName: recipient.name,
            }),
          });

          const data = await response.json();
          if (data.success) {
            sent++;
          } else {
            failed++;
          }

          // Add delay to avoid rate limiting (Gmail allows ~1 email/second)
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          failed++;
        }
      }

      result = { sent, failed, total: recipients.length };
    } else {
      // AWS SES sending
      const recipientEmails = recipients.map((r: any) => r.email);
      
      // Personalize content for each recipient
      const promises = recipients.map(async (recipient: any) => {
        const personalizedHtml = htmlContent.replace(/{{\s*name\s*}}/g, recipient.name || recipient.email.split("@")[0]);
        
        return sendBulkEmails({
          from: fromEmail,
          recipients: [recipient.email],
          subject,
          html: personalizedHtml,
          batchSize: 1,
        });
      });

      const results = await Promise.all(promises);
      
      result = {
        sent: results.reduce((sum, r) => sum + r.sent, 0),
        failed: results.reduce((sum, r) => sum + r.failed, 0),
        total: recipients.length,
      };
    }

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    });
  } catch (error: any) {
    console.error("Error in quick send:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

