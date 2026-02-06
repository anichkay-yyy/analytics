# PWA Setup Documentation

## Что настроено

### 1. PWA конфигурация
- ✅ Установлен `pwa-lib` из локального пакета
- ✅ Создан `pwa.config.ts` с настройками
- ✅ Сгенерированы иконки всех размеров (13 файлов)
- ✅ Создан `manifest.json`
- ✅ Сгенерирован Service Worker (`sw.js`)

### 2. Интеграция в приложение
- ✅ Обновлен `index.html` с мета-тегами PWA
- ✅ Создан `src/lib/pwa.ts` с утилитами
- ✅ Service Worker автоматически регистрируется в `main.tsx`
- ✅ Создан компонент `NotificationSettings` для управления уведомлениями

### 3. Стратегии кэширования
- API запросы (`/api/**`): NetworkFirst с кэшем на 5 минут
- Изображения: CacheFirst с кэшем на 30 дней (макс. 100 файлов)
- Шрифты: CacheFirst с кэшем на 1 год
- Остальное: StaleWhileRevalidate

## Как использовать

### Базовое использование PWA

PWA автоматически активируется при открытии приложения. Service Worker регистрируется в `main.tsx`:

```typescript
import { initPWA } from './lib/pwa'

initPWA().catch(console.error)
```

### Добавление уведомлений в приложение

1. Импортируйте компонент `NotificationSettings`:

```typescript
import { NotificationSettings } from '@/components/NotificationSettings'
```

2. Добавьте его в настройки или любое место:

```tsx
<NotificationSettings />
```

### Настройка VAPID ключей для push-уведомлений

**ВАЖНО:** Для работы push-уведомлений нужно настроить VAPID ключи на сервере.

#### 1. Генерация VAPID ключей

На сервере установите `web-push`:

```bash
npm install web-push
```

Сгенерируйте ключи:

```bash
npx web-push generate-vapid-keys
```

Вы получите:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LF...
Private Key: vVRJMvPDAQmPF_eFPGMVPCKXLk8-Bkd3kLo...
```

#### 2. Настройка на сервере

Сохраните ключи в переменные окружения:

```env
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LF...
VAPID_PRIVATE_KEY=vVRJMvPDAQmPF_eFPGMVPCKXLk8-Bkd3kLo...
VAPID_EMAIL=mailto:your@email.com
```

Создайте API endpoint для подписки:

```typescript
// server/routes/push.ts
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// POST /api/push/subscribe
router.post('/subscribe', async (req, res) => {
  const subscription = req.body
  // Сохраните subscription в базе данных
  // ...
  res.json({ success: true })
})

// POST /api/push/unsubscribe
router.post('/unsubscribe', async (req, res) => {
  // Удалите subscription из базы данных
  // ...
  res.json({ success: true })
})
```

#### 3. Обновление клиента

Откройте `src/components/NotificationSettings.tsx` и замените:

```typescript
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'
```

На ваш публичный ключ:

```typescript
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LF...'
```

Или лучше, получайте его с сервера:

```typescript
const response = await fetch('/api/push/vapid-public-key')
const { publicKey } = await response.json()
const subscription = await subscribeToPushNotifications(publicKey)
```

#### 4. Отправка уведомлений

```typescript
import webpush from 'web-push'

const payload = JSON.stringify({
  title: 'Новое событие',
  body: 'У вас новое уведомление',
  icon: '/icons/icon-192.png',
  badge: '/icons/icon-72.png',
  data: { url: '/dashboard' },
})

await webpush.sendNotification(subscription, payload)
```

## API функции

### `initPWA()`
Инициализирует PWA и регистрирует Service Worker.

```typescript
const registration = await initPWA()
```

### `subscribeToPushNotifications(vapidPublicKey)`
Запрашивает разрешение и подписывается на push-уведомления.

```typescript
const subscription = await subscribeToPushNotifications('YOUR_VAPID_KEY')
```

### `getPushSubscription()`
Получает текущую подписку.

```typescript
const subscription = await getPushSubscription()
```

### `unsubscribeFromPush()`
Отписывается от push-уведомлений.

```typescript
await unsubscribeFromPush()
```

### `arePushNotificationsSupported()`
Проверяет поддержку push-уведомлений.

```typescript
if (arePushNotificationsSupported()) {
  // Показать кнопку подписки
}
```

### `getNotificationPermission()`
Получает текущий статус разрешения.

```typescript
const permission = getNotificationPermission() // 'granted' | 'denied' | 'default'
```

## Разработка

### Обновление PWA конфигурации

Отредактируйте `pwa.config.ts` и запустите:

```bash
npx pwa-lib generate
```

### Watch mode

Для автоматической регенерации при изменениях:

```bash
npx pwa-lib dev
```

### Тестирование PWA

1. Запустите dev-сервер: `npm run dev`
2. Откройте Chrome DevTools → Application → Service Workers
3. Проверьте регистрацию SW
4. Application → Manifest - проверьте манифест
5. Application → Cache Storage - проверьте кэши

### Тестирование установки PWA

PWA можно установить как приложение:
1. Chrome: кнопка "Установить" в адресной строке
2. Mobile: "Добавить на главный экран"

## Файловая структура

```
admin/
├── public/
│   ├── icons/              # 13 иконок разных размеров
│   ├── manifest.json       # Web App Manifest
│   └── sw.js              # Service Worker
├── src/
│   ├── lib/
│   │   └── pwa.ts         # PWA утилиты
│   └── components/
│       └── NotificationSettings.tsx  # Компонент управления уведомлениями
└── pwa.config.ts          # Конфигурация PWA
```

## Troubleshooting

### Service Worker не регистрируется
- Проверьте консоль браузера
- Убедитесь, что приложение работает по HTTPS (или localhost)
- Проверьте путь к `sw.js`

### Уведомления не работают
- Проверьте разрешения в браузере
- Убедитесь, что настроены VAPID ключи
- Проверьте endpoint `/api/push/subscribe` на сервере

### Иконки не отображаются
- Проверьте пути в `manifest.json`
- Убедитесь, что файлы существуют в `public/icons/`
- Перегенерируйте: `npx pwa-lib generate`

## Следующие шаги

1. ✅ Базовая настройка PWA завершена
2. ⚠️  Настройте VAPID ключи на сервере
3. ⚠️  Добавьте API endpoints для подписки на уведомления
4. ⚠️  Добавьте компонент `NotificationSettings` в настройки
5. 📋 Протестируйте установку PWA
6. 📋 Протестируйте offline работу
7. 📋 Настройте отправку уведомлений с сервера
