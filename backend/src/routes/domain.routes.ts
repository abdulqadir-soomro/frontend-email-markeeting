import { Router } from 'express';
import { body } from 'express-validator';
import domainController from '../controllers/domain.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, idParamValidation, paginationValidation } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Add domain
router.post(
  '/',
  [
    body('domain')
      .notEmpty()
      .withMessage('Domain is required')
      .matches(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/)
      .withMessage('Invalid domain format'),
    validate,
  ],
  domainController.add
);

// List domains
router.get('/', paginationValidation, validate, domainController.list);

// Get domain
router.get('/:id', idParamValidation, validate, domainController.get);

// Verify domain
router.post('/:id/verify', idParamValidation, validate, domainController.verify);

// Add email to domain
router.post(
  '/:id/emails',
  idParamValidation,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    validate,
  ],
  domainController.addEmail
);

// Remove email from domain
router.delete(
  '/:id/emails',
  idParamValidation,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    validate,
  ],
  domainController.removeEmail
);

// Delete domain
router.delete('/:id', idParamValidation, validate, domainController.delete);

export default router;

