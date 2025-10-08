import { Router } from 'express';
import { body } from 'express-validator';
import templateController from '../controllers/template.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, idParamValidation, paginationValidation } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Seed default templates
router.post('/seed', templateController.seed);

// Create template
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Template name is required'),
    body('category').isIn(['marketing', 'newsletter', 'announcement', 'promotional', 'transactional']).withMessage('Valid category is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('htmlContent').notEmpty().withMessage('HTML content is required'),
    validate,
  ],
  templateController.create
);

// List templates
router.get('/', paginationValidation, validate, templateController.list);

// Get template
router.get('/:id', idParamValidation, validate, templateController.get);

// Update template
router.put('/:id', idParamValidation, validate, templateController.update);

// Delete template
router.delete('/:id', idParamValidation, validate, templateController.delete);

export default router;

