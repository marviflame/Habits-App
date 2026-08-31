# ✅ Habits — Build Better Habits Every Day

A full-stack habit tracker: track daily/weekly/monthly habits, mark completion on a week grid, see streak stats on a dashboard with a month heatmap. One container in production (Express API + SQLite + React SPA served together), or run separate Vite + Node dev servers on localhost.

```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard → Today's Progress · Best Streak · Month Heatmap  │
│  Habits    → Create/edit/delete · Icon/color picker · Week   │
│            grid checkboxes to mark today's completion         │
│  Auth      → Register / Login (JWT in header + httpOnly cookie)│
└──────────────────────────────────────────────────────────────┘
```

## ⚡ Quick Start — Local Development

> Requires Node.js ≥ 20. Both folders have their dependencies already installed under `node_modules/` — no `npm install` required to start.

### 1. Start the backend (port 4000)

```powershell
cd server

# One-time: compile TypeScript (already outputs to server/dist/)
.\node_modules\.bin\tsc.cmd --project tsconfig.json

# Start in background (persists after terminal closes)
node spawn-server.cjs          # uses detached spawn + writes server/server.pid

# OR start in foreground (kills when you close shell)
node dist/index.js
```

Verify: `GET http://localhost:4000/health` → `{ "status": "ok", "timestamp": "…" }`

### 2. Start the frontend (port 5173)

```powershell
cd client
.\node_modules\.bin\vite.cmd --port 5173
```

Visit **http://127.0.0.1:5173/**. The Vite dev server proxies all `/api/*` calls to `http://localhost:4000` (see [client/vite.config.ts](file:///c:/Users/Administrator/OneDrive/Desktop/Habits/client/vite.config.ts#L11-L17)).

### 3. Try it in the browser

1. Go to **/register** → create an account (e.g. `test@test.com` / `123456`).
2. You're auto-logged-in and redirected to the **Dashboard**.
3. Go to **Habits** → **+ New Habit** → fill name, pick icon/color, choose frequency (daily / weekly / monthly).
4. Click the **Mark done** checkbox on today's column in the week grid.
5. Return to **Dashboard** — *Today's Progress* jumps to 100%, *Best Streak* becomes 1, today's bar in "This Week" fills, and the heatmap gains a colored cell.

## 🐳 Quick Start — Docker (single container)

```powershell
cd <project-root>
docker compose up -d --build
```

The image builds the client (`vite build`) and server (`tsc`), then serves **both on port 4000** from the same Express process — no Nginx needed. Open <http://localhost:4000>.

- **SQLite DB** lives in the `habits-data` named volume at `/app/data/habits.db`
- Schema is auto-applied on startup via `prisma db push` (skipped if `SKIP_PRISMA_PUSH=1`)
- Healthcheck pings `/health` every 30s; container auto-restarts with `unless-stopped`
- Override any env var in `docker-compose.yml` → `environment:`

Stop without losing data:

```bash
docker compose down        # keep DB volume
docker compose down -v     # DELETE DB volume too (wipes all data)
```

## 🧱 Tech Stack

| Layer | Tools |
|---|---|
| **Backend** | Node.js 20, Express 4, TypeScript (CommonJS output), Prisma 5 (SQLite), Zod (validation), bcryptjs (password hashing), jsonwebtoken, cookie-parser, CORS with dynamic multi-origin callback |
| **Frontend** | React 18, Vite 5, TypeScript (strict), React Router v6, Axios, Zustand (global auth store), React Hook Form + zodResolver, TailwindCSS 3 (PostCSS 8), date-fns, react-hot-toast |
| **Runtime / Ops** | Docker multi-stage (Alpine), docker compose v2, tini init, non-root user, volume-backed SQLite, HTTP healthcheck |

## 📁 Project Structure

```
Habits/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma           ← User / Habit / HabitLog models, SQLite datasource
│   │   └── dev.db                  ← Local SQLite file (gitignored)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.ts           ← Singleton PrismaClient
│   │   │   ├── auth.ts             ← bcrypt hash/compare, JWT sign/verify
│   │   │   └── validation.ts       ← Zod schemas for register/login/habit/log
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts  ← requireAuth: extracts JWT from header or cookie
│   │   ├── routes/
│   │   │   ├── auth.routes.ts      ← /register, /login, /logout, /me
│   │   │   ├── habits.routes.ts    ← CRUD /api/habits
│   │   │   └── logs.routes.ts      ← /api/habits/:id/logs  (upsert GET DELETE)
│   │   └── index.ts                ← CORS + static SPA + routes + health + 404
│   ├── package.json                ← vite-node scripts, tsc build, prisma commands
│   ├── tsconfig.json               ← CommonJS module output, strict types
│   └── .env                        ← PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN
│
├── client/
│   ├── src/
│   │   ├── pages/                  ← LoginPage / RegisterPage / DashboardPage / HabitsPage
│   │   ├── components/Layout.tsx   ← Nav bar, user menu, Log out, <Outlet />
│   │   ├── store/authStore.ts      ← Zustand: token, user, authenticated, hydrate from localStorage
│   │   ├── lib/
│   │   │   ├── api.ts              ← Axios instance: baseURL='/api', withCredentials, 401 auto-logout
│   │   │   ├── types.ts            ← User / Habit / HabitLog / AuthState interfaces
│   │   │   └── utils.ts            ← cn()  (clsx + tailwind-merge)
│   │   ├── App.tsx                 ← BrowserRouter, auth-checked routes, hydrate /me on mount
│   │   └── index.css               ← Tailwind directives + @layer components (.btn-primary, .card, .input…)
│   ├── index.html
│   ├── vite.config.ts              ← Alias @ → src, proxy /api → localhost:4000
│   ├── tailwind.config.js          ← Content paths, custom brand color palette
│   ├── tsconfig.json               ← References tsconfig.app.json + tsconfig.node.json
│   └── package.json
│
├── Dockerfile                      ← Multi-stage: build client → build server → alpine runtime
├── docker-compose.yml              ← Build + volume + healthcheck + restart policy
├── docker-entrypoint.sh            ← Prisma db push, then exec Node (LF line endings)
└── .dockerignore                   ← node_modules, dist/, .env, logs, *.db
```

## 🔧 Environment Variables

All backends read from `server/.env` (loaded by `dotenv/config` at top of `index.ts`). In Docker, override via compose `environment:` or `-e`.

| Var | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | HTTP listen port |
| `DATABASE_URL` | `file:./dev.db` (local) / `file:/app/data/habits.db` (docker) | Prisma SQLite URL |
| `JWT_SECRET` | `habits-dev-secret-change-in-production` | ⚠️ MUST change before real use. Used to sign & verify JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiry — e.g. `7d`, `24h`, `60m` |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174` | Comma-separated allowed origins. The callback is lenient for localhost fallbacks — also accepts unknown origins during dev |
| `NODE_ENV` | `development` | `production` in Docker runtime |
| `CLIENT_DIST_DIR` | *computed relative* (`../../client/dist`) | **Production only**: absolute path to built Vite client to serve as SPA. Docker sets this to `/app/client` |

## 🔐 Authentication Flow

```
Browser client                               Express server
     │                                             │
     ├─── POST /api/auth/register {name,email,pw} ─► bcrypt.hash(pw,10) → User row → signToken(userId+email)
     │◄── 201 { user, token } + Set-Cookie hab=… ─┘
     │
     │  token saved to localStorage 'habits_token'
     │  zustand: authenticated=true → redirect /login → /
     │
     ├─── GET  /api/auth/me  (Authorization: Bearer …) ─► requireAuth() verifyToken()
     │◄── 200 { user }  ────────────────────────────────┘
     │
     ├─── POST /api/habits/* (same Bearer) ────────────► requireAuth() + per-user WHERE userId filter
     │
     └─── POST /api/auth/logout ───────────────────────► res.clearCookie('hab') + 200
```

- **Dual delivery**: JWT returned in JSON body AND `httpOnly; sameSite=lax; path=/` cookie named `hab`. Axios sends both (`withCredentials: true` + interceptor adds Bearer from localStorage).
- **Password strength** validated by Zod minimum 6 chars server-side; no client-side weakening.
- **401 auto-logout**: If any Axios call returns HTTP 401, the response interceptor calls `logout()` — clears store + localStorage, redirects to `/login`.

## 🧪 REST API

Base URL: `http://localhost:4000/api` (dev) or just `/api` (same-origin in production). All mutation payloads are validated by Zod; invalid payloads return **400** with `{ error: '…', issues: ZodIssue[] }`.

### Auth (`/auth`)

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/auth/register` | No | `{ name: string, email: string(valid email), password: string ≥6 }` | **201** `{ user: {id,name,email,createdAt}, token }` + Set-Cookie `hab` |
| POST | `/auth/login` | No | `{ email, password }` | **200** `{ user, token }` + Set-Cookie `hab`; **401** wrong creds |
| POST | `/auth/logout` | No | — | **200** `{ ok: true }`, clears cookie |
| GET  | `/auth/me` | Yes (any) | — | **200** `{ user }` for current JWT; **401** expired/missing |

### Habits (`/habits`) — always `Authorization: Bearer <token>` or cookie `hab`

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/habits` | — | `{ habits: Habit[] }` — each includes `.logs: HabitLog[]` (last 90 days), filtered to caller's userId |
| POST | `/habits` | `{ name, description?, frequency: 'daily'\|'weekly'\|'monthly', color, icon }` | **201** `{ habit: Habit }` |
| PUT | `/habits/:id` | same fields as POST (partial ok) | **200** `{ habit }` (404 if habit doesn't exist OR belongs to different user) |
| DELETE | `/habits/:id` | — | **200** `{ ok:true }` (logs cascade-deleted via Prisma `onDelete: Cascade`) |

### Habit Logs (mounted under same `/habits` router)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/habits/:id/logs` | `{ completed: boolean, date: string (ISO, optional) }` | **201** Upsert! If a log for that `(habitId, date)` already exists, it's updated. Omitting `date` → defaults to today UTC. |
| GET | `/habits/:id/logs` | — | `{ logs: HabitLog[] }` last 90 days, most recent first |
| DELETE | `/habits/:id/logs/:logId` | — | **200** `{ ok:true }` |

### Utility

| Method | Path | Auth | Returns |
|---|---|---|---|
| GET | `/health` | No | `{ status: 'ok', timestamp: ISO }` — used by Docker healthcheck |

## 📊 Dashboard Explained

When you log in, the `/` dashboard computes four things live from the current month + user's habit data:

1. **Today's Progress %** = completed habits today / total habits × 100 (rounded).
2. **Total Habits** = count of rows for the user.
3. **Best Streak** — for every habit, scan backward from today 365 days and count consecutive dates with a log where `completed=true`. Take the maximum.
4. **This Week bars** — Mon…Sun, per day ratio filled. Today highlighted with "Today" marker and `1 / 1 · 100%` after you complete a habit.
5. **Month heatmap** — 7-column grid (Mon…Sun rows), 5-6 rows for days from the Monday *before* month start up to Sunday *after* month end. Color intensity = (#completed / #habits). Two greens = "some done / all done" per legend.

## 🛠️ Common Commands

```powershell
# server/
.\node_modules\.bin\tsc.cmd --noEmit            # type-check only (no dist/ emit)
.\node_modules\.bin\tsc.cmd --project tsconfig.json   # write to dist/
.\node_modules\.bin\prisma.cmd generate         # regenerate @prisma/client from schema
.\node_modules\.bin\prisma.cmd db push --skip-generate  # apply schema to SQLite (no migration files)

# client/
.\node_modules\.bin\tsc.cmd -b --noEmit         # type-check both app + node tsconfigs
.\node_modules\.bin\vite.cmd build              # write to client/dist/
```

## 🐛 Troubleshooting

| Symptom | Likely fix |
|---|---|
| `Port 4000 = closed` after spawn-server | Check `server/server-stderr.log` for errors. Old PrismaClient cached from postgresql schema → re-run `prisma generate`. |
| `ERR_MODULE_NOT_FOUND date-fns/toDate.mjs` | Never let server import date-fns. Project uses inline helpers in [logs.routes.ts](file:///c:/Users/Administrator/OneDrive/Desktop/Habits/server/src/routes/logs.routes.ts#L6-L16) instead (the installed server-side copy is partial). |
| Register in browser hangs with "Creating account…" | Server on 4000 not running. Start it via `node spawn-server.cjs` from `server/`. |
| Dashboard flashes "Habits" nav even when on /login unauth | Benign — zustand store hydrates localStorage token synchronously before App's `/auth/me` fetch fails and calls `logout()` to reset. No data leak, just a 1-frame SSR-style paint. |
| Docker build fails `'docker' is not recognized` | Install Docker Desktop, restart shell, re-run `docker compose up -d --build`. |
| Build server step shows `npm install` not `npm ci` | No `package-lock.json` committed (only `node_modules/`). Dockerfile falls back automatically. |

## 📜 License

Private / internal project — no public license grant intended. Use within the Habits project folder context.
