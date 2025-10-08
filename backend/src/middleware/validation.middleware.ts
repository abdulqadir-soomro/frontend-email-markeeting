import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// Validation result handler
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.type === 'field' ? (error as any).path : undefined,
        message: error.msg,
      })),
    });
  }
  
  next();
};

// Common validation chains
import { body, param, query } from 'express-validator';

export const emailValidation = body('email')
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail();

export const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

export const nameValidation = body('name')
  .optional()
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters');

export const idParamValidation = param('id')
  .isMongoId()
  .withMessage('Invalid ID format');

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

