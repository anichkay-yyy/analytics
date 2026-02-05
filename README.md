# Anich Analytics

Сервис веб-аналитики с админкой и встраиваемыми виджетами.

## Быстрый старт

```bash
# Клонировать
git clone git@github.com:anichkay-yyy/analytics.git
cd analytics

# Настроить (опционально)
cp .env.example .env
nano .env  # изменить ADMIN_EMAIL и ADMIN_PASSWORD

# Запустить
sudo docker compose up -d --build
```

Админка: `http://localhost:33003`

Логин по умолчанию: `admin@example.com` / `admin123`

## Структура

```
├── server/     # API (Node.js + Express + Prisma)
├── admin/      # Админка (React + Vite + Shadcn UI)
└── docker-compose.yml
```

## Использование

### 1. Создать сайт

В админке: **Sites → Add Site** → ввести название и домен.

После создания откроется код для вставки.

### 2. Установить на сайт

Добавить перед `</body>`:

```html
<script src="https://your-analytics.com/sdk/YOUR_API_KEY.js"></script>
```

### 3. Кастомные события

```javascript
Analytics.track('button_click', { buttonId: 'signup' });
Analytics.identify('user_123', { email: 'user@example.com' });
```

### 4. Автотрекинг кликов

```html
<button data-analytics="signup_click" data-analytics-plan="free">
  Sign Up
</button>
```

## Виджеты для iframe

| Виджет | Путь | Описание |
|--------|------|----------|
| Stats | `/widget/stats?siteId=...` | Просмотры, сессии, посетители |
| Chart | `/widget/chart?siteId=...` | График просмотров |
| Pages | `/widget/pages?siteId=...` | Топ страниц |
| Realtime | `/widget/realtime?siteId=...` | Live-статистика |
| Docs | `/widget/docs` | Документация |

```html
<iframe src="https://your-analytics.com/widget/stats?siteId=SITE_ID" width="100%" height="150" frameborder="0"></iframe>
```

Список виджетов: `GET /api/widgets`

## API

Все эндпоинты доступны по `/api/...`

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
- `GET /api/stats/sites/:id/countries` — страны
- `GET /api/stats/sites/:id/cities` — города
- `GET /api/stats/sites/:id/timeline` — по дням

### SDK
- `GET /sdk.js` — базовый скрипт
- `GET /sdk/:apiKey.js` — скрипт с автоинициализацией

### Widgets
- `GET /api/widgets` — список виджетов

## Docker

```bash
# Запуск
sudo docker compose up -d

# Пересборка
sudo docker compose up -d --build

# Логи
sudo docker logs anich-analytics
sudo docker logs anich-analytics-admin

# Остановка
sudo docker compose down
```

## Переменные окружения

В `.env`:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
```

JWT секрет генерируется автоматически при первом запуске.
