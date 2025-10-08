import { Request, Response } from 'express';
import Template from '../models/Template';
import { asyncHandler } from '../middleware/error.middleware';
import { IUser } from '../models/User';

// Extend Express Request type for this controller
interface AuthRequest extends Request {
  user: IUser; // Make user required since auth middleware guarantees it
}

export class TemplateController {
  // Create template
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, category, subject, htmlContent } = req.body;
    const userId = req.user._id;

    const template = await Template.create({
      userId,
      name,
      category,
      subject,
      htmlContent,
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  });

  // List templates
  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, category } = req.query;

    const query: any = { userId };
    if (category) query.category = category;

    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Template.countDocuments(query);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  });

  // Get template
  get = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await Template.findOne({ _id: id, userId });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  });

  // Update template
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, category, subject, htmlContent } = req.body;

    const template = await Template.findOne({ _id: id, userId });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    if (name) template.name = name;
    if (category) template.category = category;
    if (subject) template.subject = subject;
    if (htmlContent) template.htmlContent = htmlContent;

    await template.save();

    res.json({
      success: true,
      data: template,
    });
  });

  // Delete template
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await Template.findOneAndDelete({ _id: id, userId });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  });

  // Seed default templates
  seed = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;

    // Check if user already has templates
    const existingTemplates = await Template.countDocuments({ userId, isDefault: true });
    if (existingTemplates > 0) {
      return res.status(400).json({
        success: false,
        error: 'Default templates already exist',
      });
    }

    const defaultTemplates = [
      {
        userId,
        name: 'Welcome Email',
        category: 'transactional',
        subject: 'Welcome to Our Platform! 🎉',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome {{name}}!</h1>
            </div>
            <div style="padding: 40px; background: #f9f9f9;">
              <p style="font-size: 16px; line-height: 1.6;">Thank you for joining us! We're excited to have you on board.</p>
              <p style="font-size: 16px; line-height: 1.6;">Get started by exploring our features and setting up your account.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© 2025 Your Company. All rights reserved.</p>
            </div>
          </div>
        `,
        isDefault: true,
      },
      {
        userId,
        name: 'Product Launch',
        category: 'announcement',
        subject: '🚀 Introducing Our New Product',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #667eea; padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">🚀 New Product Launch</h1>
            </div>
            <div style="padding: 40px;">
              <p>Hi {{name}},</p>
              <p style="font-size: 16px; line-height: 1.6;">We're thrilled to announce our latest product that will revolutionize the way you work!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Learn More</a>
              </div>
            </div>
          </div>
        `,
        isDefault: true,
      },
      {
        userId,
        name: 'Monthly Newsletter',
        category: 'newsletter',
        subject: '📰 Monthly Newsletter - {{month}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">This Month's Highlights</h2>
            <p>Hi {{name}},</p>
            <p>Here's what's new this month...</p>
            <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 20px 0;">
              <h3>Feature Update</h3>
              <p>We've added amazing new features...</p>
            </div>
          </div>
        `,
        isDefault: true,
      },
      {
        userId,
        name: 'Promotional Sale',
        category: 'promotional',
        subject: '🔥 Limited Time Offer - 50% Off!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
            <h1 style="color: #e74c3c;">🔥 Flash Sale!</h1>
            <h2>50% OFF Everything</h2>
            <p>Hi {{name}}, don't miss this incredible deal!</p>
            <a href="#" style="background: #e74c3c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 18px;">Shop Now</a>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">Offer expires in 24 hours</p>
          </div>
        `,
        isDefault: true,
      },
      {
        userId,
        name: 'Event Invitation',
        category: 'marketing',
        subject: '🎉 You\'re Invited to Our Exclusive Event',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px; text-align: center;">
              <h1 style="color: white;">You're Invited!</h1>
            </div>
            <div style="padding: 40px;">
              <p>Dear {{name}},</p>
              <p>We're hosting an exclusive event and would love to have you join us.</p>
              <p><strong>Date:</strong> [Event Date]<br><strong>Time:</strong> [Event Time]<br><strong>Location:</strong> [Event Location]</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Now</a>
              </div>
            </div>
          </div>
        `,
        isDefault: true,
      },
    ];

    await Template.insertMany(defaultTemplates);

    const templates = await Template.find({ userId, isDefault: true });

    res.status(201).json({
      success: true,
      message: '5 default templates created successfully',
      data: templates,
    });
  });
}

export default new TemplateController();

