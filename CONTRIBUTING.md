# Участие в разработке

## Запуск локально

```bash
npm ci
npm run dev
```

Убедитесь, что бэкенд запущен на `http://localhost:8000` — Vite проксирует на него `/api` и `/auth`.

## Перед коммитом

```bash
npm run lint
npm test
npm run build
```

Все три команды должны проходить без ошибок (их же гоняет CI в `.github/workflows/ci.yml`).
