# AGENTS.md

## Команды

- `npm run dev` — dev-сервер Vite
- `npm run lint` — ESLint
- `npm run build` — TypeScript + production-сборка
- `npm test` — Vitest (jsdom)

CI использует Node 20 (`.github/workflows/ci.yml`). Локальный Node 26 может ломать тесты, которым нужен `localStorage` — это особенность окружения, а не кода: помогает `NODE_OPTIONS=--localstorage-file=<путь>` и `--fileParallelism=false`.

## Стек и структура

- React 19 + TypeScript + Vite, Tailwind CSS, Vitest.
- `src/api/` — клиенты API. Контракт — OpenAPI запущенного бэкенда (`http://localhost:8000/openapi.json`).
- `src/types/index.ts` — ручные типы API.
- `src/context/CurrencyContext.tsx` — валюта профиля, `useCurrency()`.
- `src/components/` — UI; `src/components/ui/` — переиспользуемые элементы.

## Деньги и валюта

- Суммы в API и БД хранятся в валюте профиля пользователя (`users.currency`).
- Для отображения используйте `useCurrency().formatMoney` и `CURRENCY_SYMBOLS` из `src/utils/currency.ts`; не дублируйте форматирование.
- При создании расходов пользователь может выбрать валюту ввода. Переиспользуйте `InputCurrencySelect` (`src/components/ui/InputCurrencySelect.tsx`): по умолчанию валюта профиля, селектор показывается только при создании, не при редактировании.
- Передавайте `currency` в payload при создании. Для замены (`POST /replacements/bulk`) валюта уходит на верхнем уровне: `api.createReplacement(vehicleId, data, currency)`.
- Клиент не конвертирует суммы: бэкенд пересчитывает в валюту профиля по курсу ЦБ и сохраняет уже сконвертированные значения. Списки и история показывают суммы в валюте профиля.
- PATCH/PUT не принимают валюту ввода: редактирование всегда идёт в валюте профиля.

## Границы

- Web и Android (`../change_liquid_android`) развиваются отдельно; правки UI одного клиента не переносите в другой без согласования.
- При изменении API сверяйтесь с OpenAPI и синхронизируйте типы/клиенты.
