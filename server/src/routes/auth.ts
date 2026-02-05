import { Router } from 'express';
import { login, me } from '../controllers/auth';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, me);

export default router;
