import { Router } from 'express';
import trackingController from '../controllers/tracking.controller';

const router = Router();

// Track email open (no authentication required for tracking pixel)
router.get('/open/:campaignId', trackingController.trackOpen);

// Track link click (no authentication required)
router.get('/click', trackingController.trackClick);

export default router;

