import { Router } from 'express';
import {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  sendNotification,
  getStats,
} from '../controllers/push';

const router = Router();

// Public endpoint - get VAPID public key
router.get('/vapid-public-key', getVapidPublicKey);

// Subscribe to push notifications
router.post('/subscribe', subscribe);

// Unsubscribe from push notifications
router.post('/unsubscribe', unsubscribe);

// Send notification (requires authentication in production)
// TODO: Add authentication middleware
router.post('/send', sendNotification);

// Get subscription stats
router.get('/stats', getStats);

export default router;
