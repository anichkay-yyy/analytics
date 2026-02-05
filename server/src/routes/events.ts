import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apiKey';
import { trackEvent, trackBatch } from '../controllers/events';

const router = Router();

router.use(apiKeyMiddleware);

router.post('/track', trackEvent);
router.post('/batch', trackBatch);

export default router;
