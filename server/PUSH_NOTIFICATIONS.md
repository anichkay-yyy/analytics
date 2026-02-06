# Push Notifications API

## Настройка

### 1. Добавьте VAPID ключи в .env

Если у вас уже есть VAPID ключи:

```env
VAPID_PUBLIC_KEY="BEOn_h5tsl1SdhAttG84ajsYboWRIumDib4luzYE34dsTy5ntHinjVF5kMg5CjxavzdQc6Pbp-m866txIBajms4"
VAPID_PRIVATE_KEY="your-private-key-here"
VAPID_EMAIL="mailto:admin@anichkay.com"
```

Если нужно сгенерировать новые ключи:

```bash
npx web-push generate-vapid-keys
```

### 2. Перезапустите сервер

```bash
npm run dev
# или
npm run build && npm start
```

При запуске вы должны увидеть:
```
✓ Web Push configured with VAPID keys
```

## API Endpoints

### GET `/api/push/vapid-public-key`

Получить публичный VAPID ключ для подписки на клиенте.

**Response:**
```json
{
  "publicKey": "BEOn_h5tsl1SdhAttG84ajsYboWRIumDib4luzYE34dsTy5ntHinjVF5kMg5CjxavzdQc6Pbp-m866txIBajms4"
}
```

---

### POST `/api/push/subscribe`

Сохранить подписку пользователя.

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription saved"
}
```

---

### POST `/api/push/unsubscribe`

Удалить подписку пользователя.

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Unsubscribed"
}
```

---

### POST `/api/push/send`

Отправить push-уведомление всем подписчикам.

⚠️ **TODO:** Добавить аутентификацию для этого endpoint!

**Request Body:**
```json
{
  "title": "Новое событие",
  "body": "У вас новое уведомление",
  "url": "/dashboard",
  "icon": "/icons/icon-192.png",
  "badge": "/icons/icon-72.png"
}
```

**Response:**
```json
{
  "success": true,
  "sent": 5,
  "failed": 0
}
```

---

### GET `/api/push/stats`

Получить статистику подписок.

**Response:**
```json
{
  "totalSubscriptions": 5,
  "configured": true
}
```

## Использование в коде

### Отправка уведомления

```typescript
// В любом контроллере
import fetch from 'node-fetch';

async function notifyUsers(title: string, body: string, url: string) {
  try {
    const response = await fetch('http://localhost:3000/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url }),
    });

    const result = await response.json();
    console.log(`Sent to ${result.sent} users`);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// Пример использования
await notifyUsers(
  'Новый посетитель',
  'На вашем сайте новый посетитель из России',
  '/dashboard'
);
```

### Интеграция с событиями

Пример: отправлять уведомление при достижении порога посетителей:

```typescript
// В events controller
import { sendPushNotification } from '../services/push';

async function checkAndNotify(siteId: string, count: number) {
  const thresholds = [100, 500, 1000, 5000];

  if (thresholds.includes(count)) {
    await sendPushNotification({
      title: '🎉 Milestone achieved!',
      body: `Your site reached ${count} visitors`,
      url: `/sites/${siteId}`,
    });
  }
}
```

## Хранение подписок

**Текущая реализация:** In-memory Map (подписки теряются при перезапуске)

**Для продакшена:** Рекомендуется сохранять в базу данных.

### Добавление в Prisma

```prisma
// prisma/schema.prisma
model PushSubscription {
  id        String   @id @default(uuid())
  endpoint  String   @unique
  keys      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Затем обновите `controllers/push.ts` для работы с БД:

```typescript
import { prisma } from '../services/prisma';

export const subscribe = async (req: Request, res: Response) => {
  const subscription = req.body;

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    update: {
      keys: subscription.keys,
    },
  });

  res.json({ success: true });
};
```

## Тестирование

### 1. Проверка конфигурации

```bash
curl http://localhost:3000/api/push/vapid-public-key
```

### 2. Проверка статистики

```bash
curl http://localhost:3000/api/push/stats
```

### 3. Отправка тестового уведомления

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test notification",
    "body": "This is a test",
    "url": "/dashboard"
  }'
```

## Troubleshooting

### "VAPID keys not configured"

Добавьте ключи в `.env` файл и перезапустите сервер.

### Подписки не сохраняются после перезапуска

Это нормально для in-memory storage. Реализуйте хранение в БД для продакшена.

### Уведомления не приходят

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что сайт работает по HTTPS (или localhost)
3. Проверьте, что VAPID ключи корректны
4. Проверьте логи сервера при отправке

### 410 Gone errors

Это значит, что подписка больше не действительна (пользователь отписался в браузере). Контроллер автоматически удаляет такие подписки.

## Security

⚠️ **ВАЖНО:**

1. **Добавьте аутентификацию** на `/api/push/send` endpoint
2. **Не храните** VAPID private key в git
3. **Используйте HTTPS** в продакшене
4. **Ограничьте rate-limiting** для отправки уведомлений

## Next Steps

- [ ] Добавить аутентификацию на `/api/push/send`
- [ ] Переместить подписки в базу данных
- [ ] Добавить персонализированные уведомления (по пользователям)
- [ ] Добавить шаблоны уведомлений
- [ ] Настроить rate-limiting
