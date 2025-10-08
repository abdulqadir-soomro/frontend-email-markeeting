import { Router } from 'express';
import { body } from 'express-validator';
import campaignController from '../controllers/campaign.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, idParamValidation, paginationValidation } from '../middleware/validation.middleware';
import { campaignLimiter, emailLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Create campaign
router.post(
  '/',
  campaignLimiter,
  [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('htmlContent').notEmpty().withMessage('HTML content is required'),
    body('fromEmail').isEmail().withMessage('Valid from email is required'),
    body('fromName').notEmpty().withMessage('From name is required'),
    validate,
  ],
  campaignController.create
);

// List campaigns
router.get('/', paginationValidation, validate, campaignController.list);

// Get single campaign
router.get('/:id', idParamValidation, validate, campaignController.get);

// Send campaign
router.post('/:id/send', emailLimiter, idParamValidation, validate, campaignController.send);

// Get campaign recipients
router.get('/:id/recipients', idParamValidation, validate, campaignController.getRecipients);

// Get campaign analytics
router.get('/:id/analytics', idParamValidation, validate, campaignController.getAnalytics);

// Delete campaign
router.delete('/:id', idParamValidation, validate, campaignController.delete);

// Quick send (send without creating campaign)
router.post('/quick-send', emailLimiter, campaignController.quickSend);

export default router;

