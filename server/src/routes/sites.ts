import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  listSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  regenerateApiKey
} from '../controllers/sites';

const router = Router();

router.use(authMiddleware);

router.get('/', listSites);
router.get('/:id', getSite);
router.post('/', createSite);
router.patch('/:id', updateSite);
router.delete('/:id', deleteSite);
router.post('/:id/regenerate-key', regenerateApiKey);

export default router;
