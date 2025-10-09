import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication
router.use(protect);

// Get system statistics
router.get('/stats', adminController.getStats);

// Get all users
router.get('/users', adminController.getUsers);

// Get all campaigns
router.get('/campaigns', adminController.getCampaigns);

export default router;
