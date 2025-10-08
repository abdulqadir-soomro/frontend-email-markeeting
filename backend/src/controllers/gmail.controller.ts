import { Request, Response } from 'express';
import GmailCredential from '../models/GmailCredential';
import { asyncHandler } from '../middleware/error.middleware';
import gmailService from '../services/gmail.service';
import { IUser } from '../models/User';

// Extend Express Request type for this controller
interface AuthRequest extends Request {
  user: IUser; // Make user required since auth middleware guarantees it
}

export class GmailController {
  // Connect Gmail
  connect = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, appPassword } = req.body;
    const userId = req.user._id;

    // Validate Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        error: 'Only Gmail addresses are supported',
      });
    }

    // Validate app password (16 characters)
    const cleanPassword = appPassword.replace(/\s/g, '');
    if (cleanPassword.length !== 16) {
      return res.status(400).json({
        success: false,
        error: 'App password must be 16 characters',
      });
    }

    // Check if Gmail already connected
    const existing = await GmailCredential.findOne({ userId });

    if (existing) {
      // Update existing
      existing.email = email.toLowerCase();
      existing.appPassword = cleanPassword;
      existing.connected = true;
      existing.connectedAt = new Date();
      await existing.save();
    } else {
      // Create new
      await GmailCredential.create({
        userId,
        email: email.toLowerCase(),
        appPassword: cleanPassword,
        connected: true,
      });
    }

    res.json({
      success: true,
      message: 'Gmail connected successfully',
    });
  });

  // Get Gmail status
  getStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;

    const credential = await GmailCredential.findOne({ userId });

    if (!credential) {
      return res.json({
        success: true,
        data: {
          connected: false,
        },
      });
    }

    res.json({
      success: true,
      data: {
        connected: credential.connected,
        email: credential.email,
        connectedAt: credential.connectedAt,
        lastUsedAt: credential.lastUsedAt,
      },
    });
  });

  // Disconnect Gmail
  disconnect = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;

    await GmailCredential.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: 'Gmail disconnected successfully',
    });
  });

  // Test Gmail connection
  test = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;

    const result = await gmailService.testConnection(userId.toString());

    res.json({
      success: true,
      message: result.message,
    });
  });
}

export default new GmailController();

