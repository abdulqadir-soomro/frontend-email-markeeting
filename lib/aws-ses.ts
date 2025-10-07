import {
  SESv2Client,
  CreateEmailIdentityCommand,
  GetEmailIdentityCommand,
  SendEmailCommand,
  DeleteEmailIdentityCommand,
} from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Add a domain to AWS SES for verification
 */
export async function addDomain(domain: string) {
  try {
    const command = new CreateEmailIdentityCommand({
      EmailIdentity: domain,
    });
    const response = await sesClient.send(command);
    return {
      success: true,
      data: response,
      dkimTokens: response.DkimAttributes?.Tokens || [],
    };
  } catch (error: any) {
    console.error("Error adding domain to SES:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check domain verification status
 */
export async function checkDomainStatus(domain: string) {
  try {
    const command = new GetEmailIdentityCommand({
      EmailIdentity: domain,
    });
    const response = await sesClient.send(command);
    
    return {
      success: true,
      verified: response.VerifiedForSendingStatus || false,
      dkimStatus: response.DkimAttributes?.Status,
      dkimTokens: response.DkimAttributes?.Tokens || [],
    };
  } catch (error: any) {
    console.error("Error checking domain status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete a domain from AWS SES
 */
export async function deleteDomain(domain: string) {
  try {
    const command = new DeleteEmailIdentityCommand({
      EmailIdentity: domain,
    });
    await sesClient.send(command);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting domain:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Format email address for AWS SES
 * AWS SES expects plain email addresses without angle brackets
 */
function formatEmailAddress(email: string): string {
  if (!email) {
    throw new Error("Email address is required");
  }
  
  // Remove any extra whitespace
  email = email.trim();
  
  // Remove any quotes
  email = email.replace(/['"]/g, '');
  
  // Extract email from "Name <email@example.com>" format
  const emailMatch = email.match(/<([^>]+)>/);
  if (emailMatch) {
    return emailMatch[1].trim();
  }
  
  // Check for malformed brackets
  if (email.includes('<') || email.includes('>')) {
    // Remove any remaining brackets
    email = email.replace(/[<>]/g, '').trim();
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }
  
  // Return plain email
  return email;
}

/**
 * Send a single email
 */
export async function sendEmail(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  trackingPixel?: string;
}) {
  try {
    const htmlWithTracking = params.trackingPixel
      ? `${params.html}<img src="${params.trackingPixel}" width="1" height="1" style="display:none;" />`
      : params.html;

    // Format email addresses properly
    const fromEmail = formatEmailAddress(params.from);
    const toEmail = formatEmailAddress(params.to);

    console.log(`Sending email from: "${fromEmail}" to: "${toEmail}"`);

    const command = new SendEmailCommand({
      FromEmailAddress: fromEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      Content: {
        Simple: {
          Subject: {
            Data: params.subject,
          },
          Body: {
            Html: {
              Data: htmlWithTracking,
            },
          },
        },
      },
    });

    await sesClient.send(command);
    return { success: true };
  } catch (error: any) {
    console.error(`Error sending email from "${params.from}" to "${params.to}":`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send bulk emails in batches
 */
export async function sendBulkEmails(params: {
  from: string;
  recipients: string[];
  subject: string;
  html: string;
  campaignId?: string;
  batchSize?: number;
}) {
  const {
    from,
    recipients,
    subject,
    html,
    campaignId,
    batchSize = 50,
  } = params;

  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Import adminDb only if campaignId is provided (for tracking)
  let adminDb: any = null;
  if (campaignId) {
    const { adminDb: db } = await import("./firebase-admin");
    adminDb = db;
  }

  // Process in batches
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const promises = batch.map(async (email) => {
      const trackingPixel = campaignId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/track/open/${campaignId}?email=${encodeURIComponent(email)}`
        : undefined;

      const result = await sendEmail({
        from,
        to: email,
        subject,
        html,
        trackingPixel,
      });

      if (result.success) {
        results.sent++;
        
        // Create email record for tracking if campaignId is provided
        if (campaignId && adminDb) {
          try {
            await adminDb.collection("emailRecords").add({
              campaignId: campaignId,
              recipientEmail: email,
              recipientName: email.split('@')[0],
              sentAt: new Date().toISOString(),
              opened: false,
              clicked: false,
              openedAt: null,
              clickedAt: null,
            });
          } catch (error) {
            console.error(`Failed to create email record for ${email}:`, error);
          }
        }
      } else {
        results.failed++;
        results.errors.push(`${email}: ${result.error}`);
      }
    });

    await Promise.allSettled(promises);
    
    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

