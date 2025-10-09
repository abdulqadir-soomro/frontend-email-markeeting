import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import User from '../models/User';
import Campaign from '../models/Campaign';
import Subscriber from '../models/Subscriber';
import EmailRecord from '../models/EmailRecord';

interface AuthRequest extends Request {
  user?: any;
}

class AdminController {
  // Get system statistics
  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      // Check if user is admin (you can implement your own admin check logic)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get counts for all collections
      const [
        totalUsers,
        totalCampaigns,
        totalSubscribers,
        totalEmailsSent,
        activeToday,
        campaignsSentToday,
      ] = await Promise.all([
        User.countDocuments(),
        Campaign.countDocuments(),
        Subscriber.countDocuments(),
        EmailRecord.countDocuments(),
        // Active users today (users who logged in today) - using updatedAt as fallback
        User.countDocuments({
          updatedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        }),
        // Campaigns sent today
        Campaign.countDocuments({
          status: 'sent',
          sentAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        }),
      ]);

      const stats = {
        totalUsers,
        totalCampaigns,
        totalEmailsSent,
        totalSubscribers,
        activeToday,
        campaignsSentToday,
      };

      res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      console.error('Error getting admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get admin statistics',
        error: error.message,
      });
    }
  });

  // Get all users
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

      res.json({
        success: true,
        users: users.map(user => ({
          id: (user._id as any).toString(),
          email: user.email,
          name: user.name,
          role: (user as any).role || 'user',
          createdAt: user.createdAt,
          lastLoginAt: (user as any).lastLoginAt || null,
          isActive: (user as any).isActive !== false,
        })),
      });
    } catch (error: any) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message,
      });
    }
  });

  // Get all campaigns
  getCampaigns = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const campaigns = await Campaign.find()
        .populate('userId', 'email name')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        campaigns: campaigns.map(campaign => ({
          id: (campaign._id as any).toString(),
          subject: campaign.subject,
          status: campaign.status,
          recipientCount: (campaign as any).recipientCount || 0,
          sentCount: (campaign as any).sentCount || 0,
          openCount: (campaign as any).openCount || 0,
          clickCount: (campaign as any).clickCount || 0,
          createdAt: campaign.createdAt,
          sentAt: (campaign as any).sentAt || null,
          user: campaign.userId ? {
            id: (campaign.userId as any)._id?.toString(),
            email: (campaign.userId as any).email,
            name: (campaign.userId as any).name,
          } : null,
        })),
      });
    } catch (error: any) {
      console.error('Error getting campaigns:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get campaigns',
        error: error.message,
      });
    }
  });
}

export default new AdminController();
