import { Router } from 'express';
import authRoutes from './auth.routes';
import campaignRoutes from './campaign.routes';
import subscriberRoutes from './subscriber.routes';
import templateRoutes from './template.routes';
import domainRoutes from './domain.routes';
import gmailRoutes from './gmail.routes';
import trackingRoutes from './tracking.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Email Marketing API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/templates', templateRoutes);
router.use('/domains', domainRoutes);
router.use('/gmail', gmailRoutes);
router.use('/track', trackingRoutes);
router.use('/admin', adminRoutes);

export default router;

