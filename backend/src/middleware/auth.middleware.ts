import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import environment from '../config/environment';
import User, { IUser } from '../models/User';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route. Please provide a valid token.',
      });
    }

    try {
      // Verify token
      const decoded: any = jwt.verify(token, environment.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found. Token is invalid.',
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token is invalid or expired',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication',
    });
  }
};

// Admin role check
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.',
    });
  }
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    environment.JWT_SECRET,
    { expiresIn: environment.JWT_EXPIRE } as jwt.SignOptions
  );
};

