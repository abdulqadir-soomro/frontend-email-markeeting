import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const defaultTemplates = [
  {
    name: "Welcome Email",
    subject: "Welcome to Our Platform, {{name}}!",
    category: "transactional",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to EmailPro!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea;">Hi {{name}},</h2>
    
    <p>We're thrilled to have you on board! 🎉</p>
    
    <p>Your account has been successfully created, and you're now ready to experience everything we have to offer.</p>
    
    <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin-top: 0;">Quick Start Guide:</h3>
      <ul>
        <li>Complete your profile</li>
        <li>Explore our features</li>
        <li>Connect with our community</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
    </div>
    
    <p>If you have any questions, feel free to reach out to our support team.</p>
    
    <p>Best regards,<br>The EmailPro Team</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© 2025 EmailPro. All rights reserved.</p>
  </div>
</body>
</html>`
  },
  {
    name: "Product Launch",
    subject: "Introducing Our Amazing New Product!",
    category: "announcement",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px;">
    <h1 style="color: #2563eb; margin: 0;">🚀 New Product Launch</h1>
  </div>
  
  <div style="background: #f0f9ff; padding: 30px; border-radius: 10px;">
    <h2>Hey {{name}},</h2>
    
    <p style="font-size: 18px; color: #2563eb;">We've been working on something special...</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #2563eb;">Introducing [Product Name]</h3>
      <p>The solution you've been waiting for is finally here!</p>
      
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">✓ Feature 1: Amazing capability</li>
        <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">✓ Feature 2: Incredible performance</li>
        <li style="padding: 10px 0;">✓ Feature 3: Unmatched reliability</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #2563eb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Learn More</a>
    </div>
    
    <p style="color: #666; font-size: 14px; text-align: center;">Limited time offer: Get 20% off for early adopters!</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>Don't want these emails? <a href="#" style="color: #999;">Unsubscribe</a></p>
  </div>
</body>
</html>`
  },
  {
    name: "Monthly Newsletter",
    subject: "Your Monthly Update - {{month}} Edition",
    category: "newsletter",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">📰 Monthly Newsletter</h1>
    <p style="margin: 10px 0 0 0;">Stay updated with our latest news</p>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <h2>Hello {{name}},</h2>
    
    <p>Here's what happened this month:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h3 style="margin-top: 0; color: #10b981;">🎯 Highlights</h3>
      <ul>
        <li>New features released</li>
        <li>Community grew by 500+ members</li>
        <li>3 new integrations added</li>
      </ul>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <h3 style="margin-top: 0; color: #3b82f6;">📚 Recent Blog Posts</h3>
      <ul>
        <li><a href="#" style="color: #3b82f6;">How to maximize your productivity</a></li>
        <li><a href="#" style="color: #3b82f6;">10 tips for better email campaigns</a></li>
        <li><a href="#" style="color: #3b82f6;">Case study: Success story</a></li>
      </ul>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3 style="margin-top: 0; color: #f59e0b;">🎁 Special Offer</h3>
      <p>Get 25% off on annual plans this month only!</p>
      <a href="#" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Claim Offer</a>
    </div>
    
    <p>Thanks for being part of our community!</p>
    
    <p>Best regards,<br>The Team</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p><a href="#" style="color: #999;">Unsubscribe</a> | <a href="#" style="color: #999;">Update Preferences</a></p>
  </div>
</body>
</html>`
  },
  {
    name: "Promotional Sale",
    subject: "🔥 Flash Sale: Up to 50% Off!",
    category: "promotional",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 32px;">🔥 FLASH SALE</h1>
    <p style="font-size: 24px; margin: 10px 0;">Up to 50% OFF</p>
    <p style="font-size: 14px; margin: 0;">Limited Time Only!</p>
  </div>
  
  <div style="padding: 30px; background: white;">
    <h2>Don't Miss Out, {{name}}!</h2>
    
    <p style="font-size: 18px;">Our biggest sale of the year is here!</p>
    
    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="font-size: 16px; margin: 0;">Use code:</p>
      <p style="font-size: 32px; font-weight: bold; color: #dc2626; margin: 10px 0; letter-spacing: 2px;">FLASH50</p>
      <p style="font-size: 14px; color: #666; margin: 0;">Valid for next 48 hours</p>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0;">
      <div style="background: #f9fafb; padding: 15px; text-align: center; border-radius: 8px;">
        <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">50%</p>
        <p style="font-size: 12px; margin: 5px 0 0 0;">Premium Plans</p>
      </div>
      <div style="background: #f9fafb; padding: 15px; text-align: center; border-radius: 8px;">
        <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">30%</p>
        <p style="font-size: 12px; margin: 5px 0 0 0;">All Products</p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #dc2626; color: white; padding: 15px 50px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 18px;">Shop Now</a>
    </div>
    
    <p style="text-align: center; color: #666; font-size: 14px;">Hurry! Sale ends in <strong>48 hours</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© 2025 EmailPro. <a href="#" style="color: #999;">Unsubscribe</a></p>
  </div>
</body>
</html>`
  },
  {
    name: "Event Invitation",
    subject: "You're Invited: Exclusive Webinar on {{date}}",
    category: "marketing",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎓 You're Invited!</h1>
  </div>
  
  <div style="padding: 30px; background: #faf5ff;">
    <h2 style="color: #8b5cf6;">Hi {{name}},</h2>
    
    <p>We'd love for you to join our exclusive webinar!</p>
    
    <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h3 style="color: #8b5cf6; margin-top: 0;">Mastering Email Marketing in 2025</h3>
      
      <div style="border-left: 3px solid #8b5cf6; padding-left: 15px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>📅 Date:</strong> January 15, 2025</p>
        <p style="margin: 5px 0;"><strong>🕐 Time:</strong> 2:00 PM EST</p>
        <p style="margin: 5px 0;"><strong>⏱️ Duration:</strong> 60 minutes</p>
        <p style="margin: 5px 0;"><strong>💻 Platform:</strong> Zoom</p>
      </div>
      
      <h4>What You'll Learn:</h4>
      <ul style="color: #666;">
        <li>Advanced email segmentation strategies</li>
        <li>A/B testing best practices</li>
        <li>Automation workflows that convert</li>
        <li>Live Q&A session</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #8b5cf6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reserve Your Spot</a>
    </div>
    
    <p style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; color: #92400e;">
      ⚡ Limited to 100 attendees - Register now!
    </p>
    
    <p>We look forward to seeing you there!</p>
    
    <p>Best regards,<br>The EventPro Team</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p><a href="#" style="color: #999;">Add to Calendar</a> | <a href="#" style="color: #999;">Unsubscribe</a></p>
  </div>
</body>
</html>`
  }
];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if templates already exist
    const existingTemplates = await adminDb
      .collection("templates")
      .doc(userId)
      .collection("userTemplates")
      .limit(1)
      .get();

    if (!existingTemplates.empty) {
      return NextResponse.json({
        success: false,
        error: "Templates already exist for this user",
      });
    }

    // Add default templates
    const batch = adminDb.batch();
    const templatesRef = adminDb.collection("templates").doc(userId).collection("userTemplates");

    defaultTemplates.forEach((template) => {
      const docRef = templatesRef.doc();
      batch.set(docRef, {
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${defaultTemplates.length} templates created successfully`,
      count: defaultTemplates.length,
    });
  } catch (error: any) {
    console.error("Error seeding templates:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

