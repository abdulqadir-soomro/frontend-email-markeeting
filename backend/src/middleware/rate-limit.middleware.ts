import rateLimit from 'express-rate-limit';
import environment from '../config/environment';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: environment.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: environment.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Auth routes rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Email sending rate limiter
export const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many email requests, please try again later.',
  },
});

// Campaign creation rate limiter
export const campaignLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 campaigns per hour
  message: {
    success: false,
    error: 'Too many campaigns created, please try again later.',
  },
});

