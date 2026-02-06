# 🚀 PWA Quick Start

## ✅ Что уже настроено

### 1. PWA Infrastructure
- ✅ Установлен `pwa-lib` (локальная версия)
- ✅ Создан `pwa.config.ts` с настройками
- ✅ Сгенерировано 13 иконок всех размеров
- ✅ Создан `manifest.json` с метаданными приложения
- ✅ Сгенерирован Service Worker (`sw.js`) с кэшированием

### 2. Интеграция
- ✅ Обновлен `index.html` с PWA мета-тегами
- ✅ Service Worker автоматически регистрируется при запуске
- ✅ Создан модуль `src/lib/pwa.ts` с API
- ✅ Создан компонент `NotificationSettings` для управления уведомлениями

### 3. Кэширование
- API (`/api/**`): NetworkFirst, кэш 5 минут
- Изображения: CacheFirst, кэш 30 дней
- Шрифты: CacheFirst, кэш 1 год
- Остальное: StaleWhileRevalidate

## 🔧 Что нужно сделать

### 1. Настроить VAPID ключи (для push-уведомлений)

```bash
# На сервере
npm install web-push
npx web-push generate-vapid-keys
```

Сохраните ключи в `.env`:
```env
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa...
VAPID_PRIVATE_KEY=vVRJMvPDAQmPF_eFPGMVPCKXLk...
VAPID_EMAIL=mailto:your@email.com
```

### 2. Обновить NotificationSettings.tsx

Откройте `src/components/NotificationSettings.tsx` и замените:
```typescript
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'
```

### 3. Создать API endpoints на сервере

```typescript
// POST /api/push/subscribe - сохранить подписку
// POST /api/push/unsubscribe - удалить подписку
// GET /api/push/vapid-public-key - отдать публичный ключ
```

### 4. Добавить компонент в приложение

```tsx
import { NotificationSettings } from '@/components/NotificationSettings'

// В настройках или где угодно:
<NotificationSettings />
```

## 🧪 Тестирование

```bash
# Запустите dev-сервер
npm run dev

# Откройте DevTools → Application
# - Service Workers: проверьте регистрацию
# - Manifest: проверьте метаданные
# - Cache Storage: проверьте кэши
```

## 📚 Документация

Полная документация: `PWA_SETUP.md`

## 🎯 Готово к использованию!

PWA работает сразу после запуска:
- ✅ Offline-кэширование
- ✅ Установка как приложение
- ⚠️  Push-уведомления (нужны VAPID ключи)
