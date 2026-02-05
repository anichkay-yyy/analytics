# Analytics Service

Сервис веб-аналитики с админкой и встраиваемыми виджетами.

## Структура

```
├── server/          # API сервер (Node.js + Express + Prisma)
├── admin/           # React админка (Vite + Shadcn UI)
└── docker-compose.yml
```

## Быстрый старт

### 1. Запуск сервера

```bash
cd server
cp .env.example .env
npm install
npm run db:push
npm run dev
```

### 2. Запуск админки

```bash
cd admin
npm install
npm run dev
```

- Сервер: `http://localhost:3000`
- Админка: `http://localhost:5173`
- Логин: `admin@example.com` / `admin123`

### Docker

```bash
docker-compose up -d
```

## Использование

### 1. Создание сайта

В админке: **Sites → Add Site** → ввести название и домен.

После создания автоматически откроется диалог с кодом для вставки.

### 2. Установка на сайт

Добавь одну строку перед `</body>`:

```html
<script src="http://localhost:3000/sdk/ak_ваш_ключ.js"></script>
```

Готово! Аналитика начнёт собираться автоматически.

### 3. Кастомные события

```javascript
// Трекинг события
Analytics.track('button_click', { buttonId: 'signup' });

// Идентификация пользователя
Analytics.identify('user_123', { email: 'user@example.com' });
```

### 4. Автотрекинг кликов

Добавь атрибут `data-analytics` к элементам:

```html
<button data-analytics="signup_click" data-analytics-plan="free">
  Sign Up
</button>
```

## Виджеты для iframe

Встраиваемые виджеты для дашбордов:

| Виджет | URL | Описание |
|--------|-----|----------|
| Stats | `/widget/stats?siteId=...` | Карточки: просмотры, сессии, посетители |
| Chart | `/widget/chart?siteId=...` | График просмотров |
| Pages | `/widget/pages?siteId=...` | Топ страниц |
| Realtime | `/widget/realtime?siteId=...` | Live-статистика |

Пример:

```html
<iframe
  src="http://localhost:5173/widget/stats?siteId=YOUR_SITE_ID"
  width="100%"
  height="150"
  frameborder="0"
></iframe>
```

## API

### Auth
- `POST /api/auth/login` — вход
- `GET /api/auth/me` — текущий пользователь

### Sites (JWT)
- `GET /api/sites` — список
- `POST /api/sites` — создать
- `GET /api/sites/:id` — получить
- `PATCH /api/sites/:id` — обновить
- `DELETE /api/sites/:id` — удалить
- `GET /api/sites/:id/snippet` — код для вставки

### Events (API Key)
- `POST /api/events/track` — отправить событие

### Stats (JWT)
- `GET /api/stats/dashboard` — общая статистика
- `GET /api/stats/sites/:id` — статистика сайта
- `GET /api/stats/sites/:id/pages` — топ страниц
- `GET /api/stats/sites/:id/referrers` — рефереры
- `GET /api/stats/sites/:id/timeline` — по дням

### SDK
- `GET /sdk.js` — базовый скрипт
- `GET /sdk/:apiKey.js` — скрипт с автоинициализацией
