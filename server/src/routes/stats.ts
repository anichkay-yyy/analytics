import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  getSiteStats,
  getTopPages,
  getTopReferrers,
  getEventsByDay,
  getCustomEvents,
  getTopCountries,
  getTopCities,
  getDashboard
} from '../controllers/stats';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/sites/:id', getSiteStats);
router.get('/sites/:id/pages', getTopPages);
router.get('/sites/:id/referrers', getTopReferrers);
router.get('/sites/:id/timeline', getEventsByDay);
router.get('/sites/:id/events', getCustomEvents);
router.get('/sites/:id/countries', getTopCountries);
router.get('/sites/:id/cities', getTopCities);

export default router;
