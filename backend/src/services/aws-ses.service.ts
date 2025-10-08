import { SESv2Client, CreateEmailIdentityCommand, GetEmailIdentityCommand, DeleteEmailIdentityCommand, SendEmailCommand } from '@aws-sdk/client-sesv2';
import environment from '../config/environment';

// Only create SES client if credentials are provided
const sesClient = environment.AWS_ACCESS_KEY_ID && environment.AWS_SECRET_ACCESS_KEY
  ? new SESv2Client({
      region: environment.AWS_REGION,
      credentials: {
        accessKeyId: environment.AWS_ACCESS_KEY_ID,
        secretAccessKey: environment.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export class AWSSESService {
  // Add domain to AWS SES
  async addDomain(domain: string) {
    // If no AWS credentials, simulate success for testing
    if (!sesClient) {
      console.warn('AWS SES not configured - simulating domain addition');
      return {
        success: true,
        dkimTokens: ['token1', 'token2', 'token3'],
        verificationStatus: 'Pending',
      };
    }

    try {
      const command = new CreateEmailIdentityCommand({
        EmailIdentity: domain,
      });

      const response = await sesClient.send(command);

      return {
        success: true,
        dkimTokens: response.DkimAttributes?.Tokens || [],
        verificationStatus: 'Pending', // Default status for new domains
      };
    } catch (error: any) {
      console.error('Error adding domain to SES:', error);
      throw new Error(`Failed to add domain: ${error.message}`);
    }
  }

  // Check domain status
  async checkDomainStatus(domain: string) {
    // If no AWS credentials, simulate verification for testing
    if (!sesClient) {
      console.warn('AWS SES not configured - simulating domain verification');
      return {
        success: true,
        verificationStatus: 'SUCCESS', // Simulate verified domain
        dkimStatus: 'SUCCESS',
        dkimTokens: ['token1', 'token2', 'token3'],
      };
    }

    try {
      const command = new GetEmailIdentityCommand({
        EmailIdentity: domain,
      });

      const response = await sesClient.send(command);

      return {
        success: true,
        verificationStatus: response.VerificationStatus,
        dkimStatus: response.DkimAttributes?.Status,
        dkimTokens: response.DkimAttributes?.Tokens || [],
      };
    } catch (error: any) {
      console.error('Error checking domain status:', error);
      throw new Error(`Failed to check domain status: ${error.message}`);
    }
  }

  // Delete domain from AWS SES
  async deleteDomain(domain: string) {
    // If no AWS credentials, simulate success for testing
    if (!sesClient) {
      console.warn('AWS SES not configured - simulating domain deletion');
      return {
        success: true,
        message: 'Domain deleted successfully',
      };
    }

    try {
      const command = new DeleteEmailIdentityCommand({
        EmailIdentity: domain,
      });

      await sesClient.send(command);

      return {
        success: true,
        message: 'Domain deleted successfully',
      };
    } catch (error: any) {
      console.error('Error deleting domain:', error);
      throw new Error(`Failed to delete domain: ${error.message}`);
    }
  }

  // Send single email
  async sendEmail(params: {
    fromEmail: string;
    fromName: string;
    toEmail: string;
    subject: string;
    htmlContent: string;
    trackingPixel?: string;
  }) {
    // If no AWS credentials, simulate success for testing
    if (!sesClient) {
      console.warn('AWS SES not configured - simulating email send');
      return {
        success: true,
        messageId: 'simulated-message-id',
      };
    }

    try {
      const { fromEmail, fromName, toEmail, subject, htmlContent, trackingPixel } = params;

      let finalHtmlContent = htmlContent;
      
      // Add tracking pixel if provided
      if (trackingPixel) {
        finalHtmlContent = htmlContent + trackingPixel;
      }

      const command = new SendEmailCommand({
        FromEmailAddress: `${fromName} <${fromEmail}>`,
        Destination: {
          ToAddresses: [toEmail],
        },
        Content: {
          Simple: {
            Subject: {
              Data: subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: finalHtmlContent,
                Charset: 'UTF-8',
              },
            },
          },
        },
      });

      const response = await sesClient.send(command);

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Send bulk emails
  async sendBulkEmails(params: {
    fromEmail: string;
    fromName: string;
    recipients: Array<{ email: string; name?: string }>;
    subject: string;
    htmlContent: string;
    campaignId: string;
    apiUrl: string;
  }) {
    // If no AWS credentials, simulate success for testing
    if (!sesClient) {
      console.warn('AWS SES not configured - simulating bulk email send');
      const results = params.recipients.map(recipient => ({
        email: recipient.email,
        success: true,
        messageId: 'simulated-message-id',
      }));
      
      return {
        success: true,
        results,
        totalSent: results.length,
        totalFailed: 0,
      };
    }

    try {
      const { fromEmail, fromName, recipients, subject, htmlContent, campaignId, apiUrl } = params;

      const results = [];

      for (const recipient of recipients) {
        try {
          // Personalize content
          let personalizedContent = htmlContent
            .replace(/\{\{name\}\}/g, recipient.name || 'there');

          // Add tracking pixel
          const trackingPixel = `<img src="${apiUrl}/api/track/open/${campaignId}?email=${encodeURIComponent(recipient.email)}" width="1" height="1" alt="" style="display:block" />`;
          personalizedContent += trackingPixel;

          const result = await this.sendEmail({
            fromEmail,
            fromName,
            toEmail: recipient.email,
            subject,
            htmlContent: personalizedContent,
          });

          results.push({
            email: recipient.email,
            success: true,
            messageId: result.messageId,
          });
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
      console.error('Error sending bulk emails:', error);
      throw new Error(`Failed to send bulk emails: ${error.message}`);
    }
  }
}

export default new AWSSESService();