import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, emailValidation, passwordValidation, nameValidation } from '../middleware/validation.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Register
router.post(
  '/register',
  authLimiter,
  [
    emailValidation,
    passwordValidation,
    nameValidation,
    validate,
  ],
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    emailValidation,
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.login
);

// Google OAuth
router.post(
  '/google',
  [
    body('googleId').notEmpty().withMessage('Google ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    validate,
  ],
  authController.googleAuth
);

// Get current user
router.get('/me', protect, authController.getMe);

// Logout
router.post('/logout', protect, authController.logout);

export default router;

