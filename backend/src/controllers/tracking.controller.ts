import { Request, Response } from 'express';
import EmailRecord from '../models/EmailRecord';
import Campaign from '../models/Campaign';
import { asyncHandler } from '../middleware/error.middleware';

export class TrackingController {
  // Track email open
  trackOpen = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params;
    const { email } = req.query;

    if (!email) {
      // Return tracking pixel even if email is missing
      return this.sendTrackingPixel(res);
    }

    try {
      // Find email record
      const emailRecord = await EmailRecord.findOne({
        campaignId,
        recipientEmail: email as string,
      });

      if (emailRecord && !emailRecord.opened) {
        // Mark as opened
        emailRecord.opened = true;
        emailRecord.openedAt = new Date();
        emailRecord.openCount = (emailRecord.openCount || 0) + 1;
        await emailRecord.save();

        // Increment campaign open count
        await Campaign.findByIdAndUpdate(campaignId, {
          $inc: { openCount: 1 },
        });

        console.log(`✅ Email opened - Campaign: ${campaignId}, Email: ${email}`);
      } else if (emailRecord) {
        // Increment open count for repeat opens
        emailRecord.openCount = (emailRecord.openCount || 0) + 1;
        await emailRecord.save();
      }
    } catch (error) {
      console.error('Error tracking open:', error);
    }

    // Always return tracking pixel
    this.sendTrackingPixel(res);
  });

  // Track link click
  trackClick = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId, url, email } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing URL parameter',
      });
    }

    try {
      if (campaignId && email) {
        // Find email record
        const emailRecord = await EmailRecord.findOne({
          campaignId: campaignId as string,
          recipientEmail: email as string,
        });

        if (emailRecord && !emailRecord.clicked) {
          // Mark as clicked
          emailRecord.clicked = true;
          emailRecord.clickedAt = new Date();
          emailRecord.clickCount = (emailRecord.clickCount || 0) + 1;
          await emailRecord.save();

          // Increment campaign click count
          await Campaign.findByIdAndUpdate(campaignId, {
            $inc: { clickCount: 1 },
          });

          console.log(`✅ Link clicked - Campaign: ${campaignId}, Email: ${email}, URL: ${url}`);
        } else if (emailRecord) {
          // Increment click count for repeat clicks
          emailRecord.clickCount = (emailRecord.clickCount || 0) + 1;
          await emailRecord.save();
        }
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Redirect to original URL
    res.redirect(url as string);
  });

  // Send 1x1 transparent GIF pixel
  private sendTrackingPixel(res: Response) {
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    res.end(pixel);
  }

  // Test tracking endpoint (for debugging)
  testTracking = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId, email } = req.query;
    
    console.log(`🧪 Test tracking called - Campaign: ${campaignId}, Email: ${email}`);
    
    if (!campaignId || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing campaignId or email parameter',
      });
    }

    try {
      // For test tracking, create a mock email record if it doesn't exist
      let emailRecord = await EmailRecord.findOne({
        campaignId: campaignId as string,
        recipientEmail: email as string,
      });

      // If no email record exists and this is a test campaign, create a mock one
      if (!emailRecord && campaignId.toString().startsWith('test-campaign-')) {
        console.log(`🧪 Creating mock email record for test campaign: ${campaignId}`);
        
        // Create a mock email record for testing
        emailRecord = new EmailRecord({
          campaignId: campaignId as string,
          recipientEmail: email as string,
          recipientName: 'Test User',
          subject: 'Test Campaign',
          opened: false,
          clicked: false,
          sentAt: new Date(),
        });
        
        await emailRecord.save();
        console.log(`📧 Mock email record created for testing`);
      }

      if (emailRecord) {
        console.log(`📧 Found email record:`, emailRecord);
        
        // Mark as opened
        emailRecord.opened = true;
        emailRecord.openedAt = new Date();
        emailRecord.openCount = (emailRecord.openCount || 0) + 1;
        await emailRecord.save();

        // Increment campaign open count (only for real campaigns, not test ones)
        if (!campaignId.toString().startsWith('test-campaign-')) {
          await Campaign.findByIdAndUpdate(campaignId, {
            $inc: { openCount: 1 },
          });
        }

        console.log(`✅ Test tracking successful - Campaign: ${campaignId}, Email: ${email}`);
      } else {
        console.log(`❌ No email record found for Campaign: ${campaignId}, Email: ${email}`);
      }
    } catch (error) {
      console.error('Error in test tracking:', error);
    }

    res.json({
      success: true,
      message: 'Test tracking completed',
      campaignId,
      email,
    });
  });
}

export default new TrackingController();

