import { Router } from 'express';
import { body } from 'express-validator';
import subscriberController from '../controllers/subscriber.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, idParamValidation, paginationValidation, emailValidation } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Get subscriber stats
router.get('/stats', subscriberController.getStats);

// Add subscriber
router.post(
  '/',
  [
    emailValidation,
    body('name').optional().trim(),
    body('status').optional().isIn(['active', 'inactive', 'unsubscribed', 'bounced']),
    validate,
  ],
  subscriberController.add
);

// Upload CSV
router.post(
  '/upload',
  [
    body('csvData').notEmpty().withMessage('CSV data is required'),
    validate,
  ],
  subscriberController.uploadCSV
);

// Bulk delete
router.post(
  '/bulk-delete',
  [
    body('ids').isArray({ min: 1 }).withMessage('At least one ID is required'),
    validate,
  ],
  subscriberController.bulkDelete
);

// List subscribers
router.get('/', paginationValidation, validate, subscriberController.list);

// Get subscriber
router.get('/:id', idParamValidation, validate, subscriberController.get);

// Update subscriber
router.put('/:id', idParamValidation, validate, subscriberController.update);

// Delete subscriber
router.delete('/:id', idParamValidation, validate, subscriberController.delete);

export default router;

