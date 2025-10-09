import { Request, Response } from 'express';
import Subscriber from '../models/Subscriber';
import { asyncHandler } from '../middleware/error.middleware';
import { parse } from 'csv-parse/sync';
import { IUser } from '../models/User';

// Extend Express Request type for this controller
interface AuthRequest extends Request {
  user: IUser; // Make user required since auth middleware guarantees it
}

export class SubscriberController {
  // Add subscriber
  add = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, name, status = 'active', tags } = req.body;
    const userId = req.user._id;

    // Check if subscriber exists
    const existingSubscriber = await Subscriber.findOne({ userId, email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        error: 'Subscriber with this email already exists',
      });
    }

    const subscriber = await Subscriber.create({
      userId,
      email,
      name,
      status,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      data: {
        ...subscriber.toObject(),
        id: (subscriber._id as any).toString(),
      },
    });
  });

  // List subscribers
  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, search } = req.query;

    const query: any = { userId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const subscribers = await Subscriber.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Subscriber.countDocuments(query);

    // Transform _id to id for frontend compatibility
    const transformedSubscribers = subscribers.map(subscriber => ({
      ...subscriber.toObject(),
      id: (subscriber._id as any).toString(),
    }));

    res.json({
      success: true,
      data: transformedSubscribers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  });

  // Get subscriber
  get = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const subscriber = await Subscriber.findOne({ _id: id, userId });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: 'Subscriber not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...subscriber.toObject(),
        id: (subscriber._id as any).toString(),
      },
    });
  });

  // Update subscriber
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { email, name, status, tags } = req.body;

    const subscriber = await Subscriber.findOne({ _id: id, userId });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: 'Subscriber not found',
      });
    }

    // Check if email is being changed and if it's unique
    if (email && email !== subscriber.email) {
      const existingSubscriber = await Subscriber.findOne({ userId, email });
      if (existingSubscriber) {
        return res.status(400).json({
          success: false,
          error: 'Subscriber with this email already exists',
        });
      }
      subscriber.email = email;
    }

    if (name !== undefined) subscriber.name = name;
    if (status) subscriber.status = status;
    if (tags) subscriber.tags = tags;

    await subscriber.save();

    res.json({
      success: true,
      data: {
        ...subscriber.toObject(),
        id: (subscriber._id as any).toString(),
      },
    });
  });

  // Delete subscriber
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const subscriber = await Subscriber.findOneAndDelete({ _id: id, userId });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: 'Subscriber not found',
      });
    }

    res.json({
      success: true,
      message: 'Subscriber deleted successfully',
    });
  });

  // Bulk delete subscribers
  bulkDelete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ids } = req.body;
    const userId = req.user._id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No subscriber IDs provided',
      });
    }

    const result = await Subscriber.deleteMany({
      _id: { $in: ids },
      userId,
    });

    res.json({
      success: true,
      message: `${result.deletedCount} subscribers deleted successfully`,
    });
  });

  // Upload CSV
  uploadCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'No CSV data provided',
      });
    }

    try {
      // Parse CSV
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (records.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid records found in CSV',
        });
      }

      const results = {
        total: records.length,
        added: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (const record of records) {
        const email = record.email || record.Email || record.EMAIL;
        const name = record.name || record.Name || record.NAME;

        if (!email) {
          results.skipped++;
          continue;
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
          results.skipped++;
          results.errors.push(`Invalid email: ${email}`);
          continue;
        }

        try {
          // Check if subscriber exists
          const existing = await Subscriber.findOne({ userId, email });
          if (existing) {
            results.skipped++;
            continue;
          }

          // Create subscriber
          await Subscriber.create({
            userId,
            email: email.toLowerCase(),
            name,
            status: 'active',
          });

          results.added++;
        } catch (error) {
          results.skipped++;
          results.errors.push(`Error adding ${email}: ${error}`);
        }
      }

      res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: `Failed to parse CSV: ${error.message}`,
      });
    }
  });

  // Get subscriber stats
  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;

    const stats = await Subscriber.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    const total = await Subscriber.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        total,
        active: statsMap.active || 0,
        inactive: statsMap.inactive || 0,
        unsubscribed: statsMap.unsubscribed || 0,
        bounced: statsMap.bounced || 0,
      },
    });
  });
}

export default new SubscriberController();