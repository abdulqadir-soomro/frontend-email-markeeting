import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { userId, to, subject, htmlContent, recipientName, campaignId } = await req.json();

    if (!userId || !to || !subject || !htmlContent) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get Gmail credentials
    const credDoc = await adminDb
      .collection("gmailCredentials")
      .doc(userId)
      .get();

    if (!credDoc.exists || !credDoc.data()?.connected) {
      return NextResponse.json(
        { success: false, error: "Gmail not connected. Please connect your Gmail account in Settings." },
        { status: 400 }
      );
    }

    const credentials = credDoc.data();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: credentials.email,
        pass: credentials.appPassword,
      },
    });

    // Personalize content
    let personalizedContent = htmlContent.replace(/\{\{name\}\}/g, recipientName || 'there');

    // Add tracking pixel if campaignId is provided
    if (campaignId) {
      const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/track/open/${campaignId}?email=${encodeURIComponent(to)}" width="1" height="1" style="display:none;" alt="" />`;
      personalizedContent = `${personalizedContent}${trackingPixel}`;
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"${credentials.email.split('@')[0]}" <${credentials.email}>`,
      to: to,
      subject: subject,
      html: personalizedContent,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      from: credentials.email,
    });
  } catch (error: any) {
    console.error("Error sending Gmail:", error);
    
    // Handle specific Gmail errors
    let errorMessage = error.message;
    
    if (error.code === 'EAUTH') {
      errorMessage = "Gmail authentication failed. Please check your app password in Settings.";
    } else if (error.responseCode === 550) {
      errorMessage = "Recipient email address rejected. Please verify the email address.";
    } else if (error.message.includes('Daily user sending quota exceeded')) {
      errorMessage = "Gmail daily sending limit reached (500 emails/day). Try again tomorrow or use AWS SES.";
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

