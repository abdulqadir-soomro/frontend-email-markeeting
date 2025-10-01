import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    const { emails, from, subject, accessKeyId, secretAccessKey, delayMs = 2000 } = req.body;

    // Enhanced validation
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "No emails provided or invalid email list format" 
      });
    }

    if (!from || !subject) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: from and subject are required" 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid sender email address format' 
      });
    }

    // Subject validation
    if (subject.length > 200) {
      return res.status(400).json({ 
        success: false,
        error: 'Email subject must be less than 200 characters' 
      });
    }

    // Validate email list
    const validEmails = [];
    const invalidEmails = [];
    
    for (let i = 0; i < emails.length; i++) {
      const emailData = emails[i];
      if (emailData && emailData.email && emailRegex.test(emailData.email)) {
        validEmails.push({
          email: emailData.email,
          name: emailData.name || 'there'
        });
      } else {
        invalidEmails.push({
          index: i,
          email: emailData?.email || 'undefined',
          error: 'Invalid email format'
        });
      }
    }

    if (validEmails.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No valid email addresses found in the list' 
      });
    }

    // Get AWS region from environment variable
    const selectedRegion = process.env.AWS_REGION || 'us-east-2';
    
    // Region validation
    const validRegions = [
      'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
      'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2', 'eu-north-1', 'eu-south-1', 'eu-south-2',
      'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3', 'ap-southeast-4', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-south-1', 'ap-south-2', 'ap-east-1',
      'me-south-1', 'me-central-1', 'af-south-1',
      'ca-central-1', 'ca-west-1',
      'sa-east-1'
    ];

    if (!validRegions.includes(selectedRegion)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid AWS region specified in environment configuration' 
      });
    }

    // Delay validation
    const delay = Math.max(100, Math.min(10000, parseInt(delayMs) || 2000)); // Between 100ms and 10s

    // Initialize SES client with error handling
    let sesClient;
    try {
      if (accessKeyId && secretAccessKey) {
        // Validate credentials format
        if (typeof accessKeyId !== 'string' || accessKeyId.length < 16) {
          throw new Error('Invalid AWS Access Key ID format');
        }
        if (typeof secretAccessKey !== 'string' || secretAccessKey.length < 16) {
          throw new Error('Invalid AWS Secret Access Key format');
        }

        sesClient = new SESClient({
          region: selectedRegion,
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          },
        });
      } else {
        // Use environment variables
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
          return res.status(500).json({ 
            success: false,
            error: 'AWS credentials not configured. Please provide accessKeyId and secretAccessKey or configure environment variables.' 
          });
        }

        sesClient = new SESClient({
          region: selectedRegion,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
      }
    } catch (credError) {
      console.error('Error initializing SES client:', credError);
      return res.status(500).json({ 
        success: false,
        error: `AWS credentials error: ${credError.message}` 
      });
    }

    const results = {
      total: validEmails.length,
      sent: 0,
      failed: 0,
      errors: [],
      invalidEmails: invalidEmails
    };

    // Send emails with delay and comprehensive error handling
    for (let i = 0; i < validEmails.length; i++) {
      const { email, name } = validEmails[i];
      
      try {
        // Generate email content with error handling
        let emailHtml;
        try {
          emailHtml = generateEmailHTML(name);
        } catch (contentError) {
          throw new Error('Error generating email content: ' + contentError.message);
        }

        // Validate email content
        if (!emailHtml || emailHtml.length === 0) {
          throw new Error('Generated email content is empty');
        }
        
        const params = {
          Source: from,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: subject },
            Body: {
              Html: { Data: emailHtml },
            },
          },
        };

        // Add timeout wrapper for individual email
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Email sending request timed out')), 30000); // 30 second timeout
        });

        const command = new SendEmailCommand(params);
        const response = await Promise.race([
          sesClient.send(command),
          timeoutPromise
        ]);

        if (!response || !response.MessageId) {
          throw new Error('No message ID returned from AWS SES');
        }
        
        results.sent++;
        console.log(`✅ Email sent to ${email}`);

      } catch (error) {
        results.failed++;
        let errorMessage = error.message;
        
        // Handle specific AWS SES errors
        if (error.name === 'MessageRejected') {
          if (error.message.includes('Email address is not verified')) {
            errorMessage = 'Sender email address is not verified in AWS SES';
          } else if (error.message.includes('Account sending quota exceeded')) {
            errorMessage = 'Account sending quota exceeded';
          } else if (error.message.includes('Daily sending quota exceeded')) {
            errorMessage = 'Daily sending quota exceeded';
          }
        } else if (error.name === 'ThrottlingException') {
          errorMessage = 'Request rate too high, throttled by AWS';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out';
        }

        results.errors.push({
          email: email,
          error: errorMessage,
          errorType: error.name || 'UnknownError'
        });
        console.error(`❌ Error sending to ${email}:`, errorMessage);
      }

      // Add delay between emails (except for the last one)
      if (i < validEmails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    res.status(200).json({
      success: true,
      results: results,
      region: selectedRegion,
      delayMs: delay
    });

  } catch (error) {
    console.error("Error in bulk send:", error);
    
    let errorMessage = error.message;
    let statusCode = 500;

    if (error.message.includes('timeout')) {
      statusCode = 408;
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      statusCode = 503;
      errorMessage = 'Network error. Please check your internet connection.';
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      errorType: error.name || 'UnknownError'
    });
  }
}

function generateEmailHTML(recipientName) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boost Your Business with Digital Solutions</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9;">
  <table width="100%" style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
  <tr>
  <td>
  <p>Hi ${recipientName || "there"},</p>
  <p>I'm <b>Patrick</b> from <b><a href="https://saynintech.com/" target="_blank">SAYNIN TECH</a></b>. We provide <b>custom software solutions</b> to improve business efficiency, customer engagement, and online presence.</p>
  
  <h3 style="color: #333;">Our <a href="https://saynintech.com/portfolio/" target="_blank">Expertise</a>:</h3>
  <ul>
  <li><b>Web & Mobile Development</b> – Fast, secure, and scalable solutions tailored to your business.</li>
  <li><b>E-Commerce Solutions</b> – Optimized online stores with smooth checkout and payment integration.</li>
  <li><b>SEO & Digital Marketing</b> – Improve search rankings and engage your audience effectively.</li>
  <li><b>Branding & UI/UX Design</b> – Professional branding, graphics, and seamless user experience.</li>
  </ul>
  
  <p>Let's explore how our solutions can help your business. Would you be open to a quick discussion?</p>
  
  <p>Best regards,</p>
  <p><b>Patrick</b><br>
  <a href="https://saynintech.com/" target="_blank">SAYNIN TECH</a><br>
  📩 <a href="mailto:services@saynintech.com">services@saynintech.com</a></p>
  
  <p style="font-size: 12px; color: gray;">
  If you'd rather not receive emails from us, <a href="{unsubscribe_link}" style="color: #999;">click here to unsubscribe</a>.
  </p>
  </td>
  </tr>
  </table>
  </body>
  </html>`;
}