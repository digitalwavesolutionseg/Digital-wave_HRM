# Digital Wave HRM

Enterprise Human Resource Management system.

- **Frontend:** Next.js 16 (App Router, React 19, Tailwind v4, TanStack Table, Recharts) — deployed on **Vercel** at [hrm.digital-wave.solutions](https://hrm.digital-wave.solutions)
- **Backend:** NestJS 11 + Prisma 7 (PostgreSQL) — deployed on **Railway** at `https://digital-wave-hrm-api-production.up.railway.app`
- **Database:** Supabase PostgreSQL (project `rposvfugpfxtiirwihzu`, region `eu-central-1`)

## Repository layout

```
app/                  Next.js frontend (App Router)
components/           UI components and providers
lib/                  API client, utils, navigation
backend/src/          NestJS API (modules/*, auth, guards, audit)
backend/prisma/       Schema + migrations
scripts/              One-off maintenance scripts
```

## Local development

```bash
# frontend (http://localhost:3000)
npm install
npm run dev

# backend (http://localhost:3001, Swagger at /api-docs)
cd backend
npm install
npx prisma migrate deploy   # or: npx prisma migrate dev
npm run start:dev
```

### Environment variables

**Frontend** (`.env.local`):

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:3001/api` |

**Backend** (`backend/.env`):

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (see pooler note below) |
| `JWT_ACCESS_SECRET` | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | Token lifetimes (15m / 7d) |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `RESEND_API_KEY` | Resend key for password-reset OTP emails (optional) |
| `RESEND_FROM_EMAIL` | From address for OTP emails |

## Supabase connection (important)

The direct host `db.<ref>.supabase.co` is **IPv6-only** and unreachable from IPv4-only
networks (and fails with `P1001` from Prisma). Always connect through the regional
session pooler:

```
postgresql://postgres.<project-ref>:<password>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public
```

`scripts/find-pooler-region.cjs` probes all regions to locate the right pooler host.

If a Supabase project gets paused, restore it from the Supabase dashboard; connections
then work again through the pooler without further changes.

## Deployment

- **Frontend:** Vercel auto-deploys `main` (project `digital-wave-hrm`). Custom domain:
  `hrm.digital-wave.solutions`.
- **Backend:** Railway (project `digital-wave-hrm-api`). Deploys are manual from the
  `backend/` directory:

  ```bash
  cd backend
  railway up
  ```

  Set variables with `railway variables --set "KEY=value" --skip-deploys`. Swagger is
  disabled when `NODE_ENV=production`; security headers via `helmet` are always on.
  Health check: `GET /api/health` → `{ status: "ok", database: "up" }`.

## Roles

`SUPER_ADMIN`, `HR`, `MANAGER`, `FINANCE`, `RECRUITER`, `EMPLOYEE`. Registration always
creates `EMPLOYEE`; only a `SUPER_ADMIN` can change roles.
