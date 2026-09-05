# PromptStudio AI — Backend Documentation

> Production-ready Node.js 22 + Express.js backend with Prisma ORM + Neon PostgreSQL

## Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Setup database (migrations + seed)
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 3. Start backend
npm run server

# 4. Start frontend (separate terminal)
npm run dev
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@promptstudio.ai | admin123 |
| Demo  | demo@promptstudio.ai  | 123456   |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run server` | Start Express backend |
| `npm run server:dev` | Backend with hot-reload |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Apply migrations |
| `npm run prisma:seed` | Seed demo data |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run setup` | Full setup (install + migrate + seed) |
| `npm run dev` | Start Vite frontend |

## Key API Endpoints

- `POST /api/auth/login` — Login (returns role for frontend redirect)
- `POST /api/auth/demo` — Demo login
- `POST /api/prompts/generate` — Generate prompt via AI
- `GET /api/health` — Health check
- `GET /api/system/info` — Public app settings
- `GET /api/admin/dashboard` — Admin stats (requires admin JWT)

See full API docs at `http://localhost:3001/api/docs` (dev mode).

## Vercel Deployment

Set these env vars in Vercel Dashboard:
- `DATABASE_URL`, `DIRECT_URL` — Neon PostgreSQL connection strings
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — Random 64-char secrets
- `ENCRYPTION_SECRET` — Exactly 32 characters
- `NODE_ENV=production`
- `APP_URL=https://your-app.vercel.app`
- `CORS_ORIGINS=https://your-app.vercel.app`
