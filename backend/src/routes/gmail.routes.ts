import { Router } from 'express';
import { body } from 'express-validator';
import gmailController from '../controllers/gmail.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Connect Gmail
router.post(
  '/connect',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('appPassword').notEmpty().withMessage('App password is required'),
    validate,
  ],
  gmailController.connect
);

// Get Gmail status
router.get('/status', gmailController.getStatus);

// Disconnect Gmail
router.delete('/disconnect', gmailController.disconnect);

// Test connection
router.get('/test', gmailController.test);

export default router;

