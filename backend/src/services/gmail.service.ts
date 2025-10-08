import nodemailer from 'nodemailer';
import GmailCredential from '../models/GmailCredential';

export class GmailService {
  // Send email via Gmail
  async sendEmail(params: {
    userId: string;
    toEmail: string;
    toName?: string;
    subject: string;
    htmlContent: string;
    trackingPixel?: string;
  }) {
    try {
      const { userId, toEmail, toName, subject, htmlContent, trackingPixel } = params;

      // Get Gmail credentials
      const credentials = await GmailCredential.findOne({ userId }).select('+appPassword');
      
      if (!credentials) {
        throw new Error('Gmail not connected. Please connect your Gmail account first.');
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: credentials.email,
          pass: credentials.appPassword,
        },
      });

      // Prepare email content
      let finalHtmlContent = htmlContent;
      if (trackingPixel) {
        finalHtmlContent = htmlContent + trackingPixel;
      }

      // Personalize content
      if (toName) {
        finalHtmlContent = finalHtmlContent.replace(/\{\{name\}\}/g, toName);
      }

      // Send email
      const info = await transporter.sendMail({
        from: `${credentials.email}`,
        to: toEmail,
        subject,
        html: finalHtmlContent,
      });

      // Update last used timestamp
      await GmailCredential.findByIdAndUpdate(credentials._id, {
        lastUsedAt: new Date(),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('Error sending Gmail:', error);
      
      // Handle specific Gmail errors
      if (error.code === 'EAUTH') {
        throw new Error('Gmail authentication failed. Please check your app password.');
      } else if (error.code === 'EMESSAGE') {
        throw new Error('Gmail daily sending limit reached (500 emails/day).');
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Send bulk emails with rate limiting (Gmail limit: 500/day)
  async sendBulkEmails(params: {
    userId: string;
    recipients: Array<{ email: string; name?: string }>;
    subject: string;
    htmlContent: string;
    campaignId: string;
    apiUrl: string;
  }) {
    try {
      const { userId, recipients, subject, htmlContent, campaignId, apiUrl } = params;

      // Check Gmail daily limit
      if (recipients.length > 500) {
        throw new Error('Gmail allows maximum 500 emails per day. Please use AWS SES for larger campaigns or split into multiple days.');
      }

      const results = [];
      const delayBetweenEmails = 1500; // 1.5 seconds delay to avoid rate limiting

      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        try {
          // Add tracking pixel
          const trackingPixel = `<img src="${apiUrl}/api/track/open/${campaignId}?email=${encodeURIComponent(recipient.email)}" width="1" height="1" alt="" style="display:block" />`;

          const result = await this.sendEmail({
            userId,
            toEmail: recipient.email,
            toName: recipient.name,
            subject,
            htmlContent,
            trackingPixel,
          });

          results.push({
            email: recipient.email,
            success: true,
            messageId: result.messageId,
          });

          // Delay between emails to avoid rate limiting
          if (i < recipients.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayBetweenEmails));
          }
        } catch (error: any) {
          results.push({
            email: recipient.email,
            success: false,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        results,
        totalSent: results.filter((r) => r.success).length,
        totalFailed: results.filter((r) => !r.success).length,
      };
    } catch (error: any) {
      console.error('Error sending bulk Gmail:', error);
      throw error;
    }
  }

  // Test Gmail connection
  async testConnection(userId: string) {
    try {
      const credentials = await GmailCredential.findOne({ userId }).select('+appPassword');
      
      if (!credentials) {
        throw new Error('Gmail not connected');
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: credentials.email,
          pass: credentials.appPassword,
        },
      });

      await transporter.verify();

      return {
        success: true,
        message: 'Gmail connection successful',
      };
    } catch (error: any) {
      throw new Error(`Gmail connection failed: ${error.message}`);
    }
  }
}

export default new GmailService();

