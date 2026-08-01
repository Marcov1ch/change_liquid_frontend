# ChangeLiquid

Веб-сервис для отслеживания замен жидкостей и расходников автомобиля. Помогает вести учёт пробега, интервалов замены, получать уведомления о предстоящем ТО и фиксировать поездки по GPS.

## Возможности

- Учёт нескольких автомобилей (активные / архивные, мягкое и полное удаление)
- Интервалы замен по компонентам с настраиваемыми уведомлениями
- Журнал замен жидкостей с ценой детали и работы
- Статусы обслуживания: `good` / `warning` / `critical` / `overdue`
- GPS-трекинг поездок с автоматическим обновлением пробега (переживает перезагрузку страницы)
- Профиль: смена email и пароля, удаление аккаунта
- Восстановление пароля по email (токен из письма)

## Стек

- React 19, TypeScript (strict), Vite
- Tailwind CSS (Material 3-подобная дизайн-система, классы `md3-*`)
- TanStack Query, React Router
- Vitest + jsdom (тесты)

## Требования

- Node.js 20+

## Установка и запуск

```bash
npm ci
npm run dev
```

Vite проксирует запросы `/api` и `/auth` на бэкенд `http://localhost:8000` (см. `vite.config.ts`).

## Скрипты

| Команда | Описание |
| --- | --- |
| `npm run dev` | Запуск dev-сервера с HMR |
| `npm run build` | Проверка типов (`tsc -b`) + сборка в `dist/` |
| `npm run lint` | ESLint |
| `npm test` | Запуск тестов (Vitest) |
| `npm run preview` | Предпросмотр production-сборки |

## Структура проекта

```
src/
├── api/client.ts       # HTTP-клиент, refresh-токены, все API-методы
├── components/         # UI-компоненты (формы, списки, модалки, трекинг)
├── context/            # AuthContext, ToastContext
├── hooks/              # useGpsTracker, useVehicleForm, useEnums
├── pages/              # Home, Login, Register, Profile, Password-страницы
├── types/index.ts      # Vehicle, Replacement, User и др.
└── utils/              # Валидация госномеров (РФ/РБ) + тесты
```

## API

- Базовые пути: `/api/v1` (ресурсы) и `/auth` (аутентификация)
- Авторизация: Bearer-токен в заголовке `Authorization`
- `client.ts` автоматически обновляет токены по `refresh_token` при `401`
- Токены хранятся в `localStorage` (`access_token`, `refresh_token`)

## Деплой

- `Dockerfile` — multi-stage сборка: node → статика → nginx (`nginx.conf` с SPA-fallback на `index.html`)
- CI (`.github/workflows/ci.yml`): lint → test → build → deploy по SSH
- Серверные секреты: `SSH_HOST`, `SSH_USER`, `SSH_KEY` (GitHub Secrets)
