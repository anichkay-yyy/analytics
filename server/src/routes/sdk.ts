import { Router } from 'express';
import { getSDKScript, getSDKScriptWithKey, getSnippet, getWidgets } from '../controllers/sdk';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Публичные эндпоинты для скрипта
router.get('/sdk.js', getSDKScript);
router.get('/sdk/:apiKey.js', getSDKScriptWithKey);

// Получить сниппет для вставки (требует авторизации)
router.get('/api/sites/:id/snippet', authMiddleware, getSnippet);

// Список виджетов
router.get('/api/widgets', getWidgets);

export default router;
