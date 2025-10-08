import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

// Extend Express Request type for this controller
interface AuthRequest extends Request {
  user?: IUser;
}

export class AuthController {
  // Register user
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  });

  // Login user
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  });

  // Google OAuth login
  googleAuth = asyncHandler(async (req: Request, res: Response) => {
    const { googleId, email, name, avatar } = req.body;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        googleId,
        email,
        name,
        avatar,
        isEmailVerified: true,
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  });

  // Get current logged in user
  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }
    
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  });

  // Logout user (client-side token removal)
  logout = asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}

export default new AuthController();

