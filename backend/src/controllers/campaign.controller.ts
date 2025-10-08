import { Request, Response } from 'express';
import Campaign from '../models/Campaign';
import Subscriber from '../models/Subscriber';
import EmailRecord from '../models/EmailRecord';
import { asyncHandler } from '../middleware/error.middleware';
import awsSESService from '../services/aws-ses.service';
import gmailService from '../services/gmail.service';
import environment from '../config/environment';
import { IUser } from '../models/User';

// Extend Express Request type for this controller
interface AuthRequest extends Request {
  user: IUser; // Make user required since auth middleware guarantees it
}

export class CampaignController {
  // Create campaign
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subject, htmlContent, fromEmail, fromName, templateId } = req.body;
    const userId = req.user._id;

    const campaign = await Campaign.create({
      userId,
      subject,
      htmlContent,
      fromEmail,
      fromName,
      templateId,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  });

  // List campaigns
  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status) query.status = status;

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('templateId', 'name category');

    const total = await Campaign.countDocuments(query);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  });

  // Get single campaign
  get = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await Campaign.findOne({ _id: id, userId }).populate('templateId');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      data: campaign,
    });
  });

  // Send campaign
  send = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { sendingMethod = 'ses' } = req.body;

    // Get campaign
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    // Get active subscribers
    const subscribers = await Subscriber.find({
      userId,
      status: 'active',
    });

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active subscribers found',
      });
    }

    // Check Gmail limit
    if (sendingMethod === 'gmail' && subscribers.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Gmail allows maximum 500 emails per day. Please use AWS SES or reduce recipients.',
      });
    }

    // Update campaign status
    campaign.status = 'sending';
    campaign.sendingMethod = sendingMethod as any;
    await campaign.save();

    try {
      // Prepare recipients
      const recipients = subscribers.map((sub) => ({
        email: sub.email,
        name: sub.name,
      }));

      // Send emails
      let result;
      if (sendingMethod === 'gmail') {
        result = await gmailService.sendBulkEmails({
          userId: userId.toString(),
          recipients,
          subject: campaign.subject,
          htmlContent: campaign.htmlContent,
          campaignId: campaign._id.toString(),
          apiUrl: environment.API_URL,
        });
      } else {
        result = await awsSESService.sendBulkEmails({
          fromEmail: campaign.fromEmail,
          fromName: campaign.fromName,
          recipients,
          subject: campaign.subject,
          htmlContent: campaign.htmlContent,
          campaignId: campaign._id.toString(),
          apiUrl: environment.API_URL,
        });
      }

      // Create email records
      const emailRecords = subscribers.map((subscriber) => ({
        campaignId: campaign._id,
        subscriberId: subscriber._id,
        recipientEmail: subscriber.email,
        sentAt: new Date(),
      }));

      await EmailRecord.insertMany(emailRecords);

      // Update campaign
      campaign.status = 'sent';
      campaign.sentCount = result.totalSent;
      campaign.sentAt = new Date();
      await campaign.save();

      res.json({
        success: true,
        message: 'Campaign sent successfully',
        data: {
          campaign,
          results: result,
        },
      });
    } catch (error: any) {
      // Update campaign status to failed
      campaign.status = 'failed';
      await campaign.save();

      throw error;
    }
  });

  // Delete campaign
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await Campaign.findOneAndDelete({ _id: id, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    // Delete associated email records
    await EmailRecord.deleteMany({ campaignId: id });

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  });

  // Get campaign recipients
  getRecipients = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    const emailRecords = await EmailRecord.find({ campaignId: id })
      .populate('subscriberId', 'name email status')
      .sort({ sentAt: -1 });

    res.json({
      success: true,
      data: emailRecords,
    });
  });

  // Get campaign analytics
  getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    // Aggregate email records
    const stats = await EmailRecord.aggregate([
      { $match: { campaignId: campaign._id } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          totalOpened: { $sum: { $cond: ['$opened', 1, 0] } },
          totalClicked: { $sum: { $cond: ['$clicked', 1, 0] } },
          totalBounced: { $sum: { $cond: ['$bounced', 1, 0] } },
        },
      },
    ]);

    const analytics = stats[0] || {
      totalSent: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalBounced: 0,
    };

    res.json({
      success: true,
      data: {
        campaign,
        analytics: {
          ...analytics,
          openRate: analytics.totalSent > 0 
            ? ((analytics.totalOpened / analytics.totalSent) * 100).toFixed(2)
            : '0.00',
          clickRate: analytics.totalSent > 0
            ? ((analytics.totalClicked / analytics.totalSent) * 100).toFixed(2)
            : '0.00',
          bounceRate: analytics.totalSent > 0
            ? ((analytics.totalBounced / analytics.totalSent) * 100).toFixed(2)
            : '0.00',
        },
      },
    });
  });

  // Quick send (send without creating campaign)
  quickSend = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { recipients, subject, htmlContent, fromEmail, fromName, sendingMethod = 'ses' } = req.body;
    const userId = req.user._id;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No recipients provided',
      });
    }

    // Check Gmail limit
    if (sendingMethod === 'gmail' && recipients.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Gmail allows maximum 500 emails per day.',
      });
    }

    // Send emails (without creating campaign or email records)
    let result;
    const tempCampaignId = 'quick-send-' + Date.now();

    if (sendingMethod === 'gmail') {
      result = await gmailService.sendBulkEmails({
        userId: userId.toString(),
        recipients,
        subject,
        htmlContent,
        campaignId: tempCampaignId,
        apiUrl: environment.API_URL,
      });
    } else {
      result = await awsSESService.sendBulkEmails({
        fromEmail,
        fromName,
        recipients,
        subject,
        htmlContent,
        campaignId: tempCampaignId,
        apiUrl: environment.API_URL,
      });
    }

    res.json({
      success: true,
      message: 'Emails sent successfully',
      data: result,
    });
  });
}

export default new CampaignController();

