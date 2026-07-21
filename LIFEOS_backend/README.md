# LifeOS Backend

Node.js + TypeScript + Express + Prisma/PostgreSQL backend for the LifeOS frontend.

## Audit summary (this pass)

Re-audited the previously delivered backend against the frontend's actual service
calls — no drift found, all 9 modules (auth, tasks, goals, habits, finance, health,
journal, projects, ai) still registered and matching. On top of that baseline, this
pass adds the features explicitly requested that weren't in the original frontend
contract:

- **Google OAuth** (Passport strategy, `/auth/google` + `/auth/google/callback`).
  Gracefully disabled (clear error, not a crash) if `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are unset.
- **Forgot / reset password**, **email verification**, **resend verification**,
  **change password**, **delete account** — all real, using a `nodemailer`-based
  mailer that sends real email if SMTP is configured, or logs the link if not
  (so registration/reset flows keep working in local dev with zero mail setup).
- **Socket.IO**, JWT-authenticated on the handshake (same access token as the REST API),
  with per-user rooms. Wired into real events: `task:completed`, `task:updated`,
  `xp:updated`, `habit:completed` — not a decorative empty server.
- **AI provider fallback chain**: `AI_PROVIDER=auto` tries Gemini -> OpenAI -> Grok -> OpenRouter -> Anthropic,
  in order, using whichever has a key configured, and automatically retries the next
  provider if one fails. Never throws for "nothing configured" — returns an honest,
  clearly-worded fallback message instead of a fake AI answer or a raw 500.

### One thing worth knowing

The frontend has **no page or code that consumes** `/auth/google/callback`'s redirect
(`FRONTEND_URL/auth/callback?accessToken=...&refreshToken=...`), and no socket client.
The backend endpoints are real and fully functional — you can hit them directly or with
a REST client today — but to use Google login or live updates *from the UI*, the frontend
needs a small addition: a `/auth/callback` route that reads the query params and calls
`AuthContext`'s login-with-tokens path, and a `socket.io-client` connection using the
stored `lifeos_token`. I didn't add these because the instructions said preserve the
frontend structure and only touch it if something is broken — this isn't broken, it's
just not wired up yet. Say the word and I'll add both.

## Setup

```bash
cp .env.example .env    # fill in DATABASE_URL, JWT secrets, AI keys, Google/SMTP if wanted
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed      # optional — creates demo@lifeos.app / Password123!
npm run dev               # http://localhost:5000, docs at /api-docs
```

### Docker

```bash
cp .env.example .env
docker compose up --build
```

### Tests

```bash
docker compose up postgres -d
npx prisma migrate deploy
npm test
```

## Verify before relying on this in production

This sandbox's network allowlist blocks `binaries.prisma.sh`, so `npx prisma generate`
and a full `tsc` build could not be run end-to-end here. Every file was syntax-checked
individually (esbuild, zero errors across all backend files including the new modules),
and `npm install` succeeded cleanly with all new dependencies (passport, socket.io,
nodemailer) resolved. The real verification is running the setup steps above yourself —
if `npm run build`, `npx prisma migrate dev`, and `npm run dev` succeed on your machine,
the code is genuinely correct.

## Full endpoint list

| Module | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `GET /auth/me`, `POST /auth/change-password`, `DELETE /auth/account`, `POST /auth/forgot-password`, `/reset-password`, `/verify-email`, `/resend-verification`, `GET /auth/google`, `GET /auth/google/callback` |
| Tasks | `GET/POST /tasks`, `GET/PUT/DELETE /tasks/:id`, `GET /tasks/stats` |
| Goals | `GET/POST /goals`, `GET/PUT/DELETE /goals/:id` |
| Habits | `GET/POST /habits`, `GET/PUT/DELETE /habits/:id`, `POST /habits/:id/complete`, `GET /habits/stats` |
| Finance | `GET/POST /finance`, `PUT/DELETE /finance/:id`, `GET/POST /finance/budgets`, `GET /finance/stats`, `GET /finance/trends` |
| Health | `GET/POST /health`, `PUT/DELETE /health/:id`, `GET /health/stats` |
| Journal | `GET/POST /journal`, `GET/PUT/DELETE /journal/:id` |
| Projects | `GET/POST /projects`, `GET/PUT/DELETE /projects/:id` |
| AI | `POST /ai/chat`, `POST /ai/summarize`, `GET /ai/insights`, `GET /ai/daily-plan` |

Swagger UI for all of the above: `GET /api-docs`.

## Environment variables

See `.env.example`. Every optional integration (Google OAuth, SMTP, each AI provider)
degrades gracefully and explicitly when unconfigured — the server never crashes on
missing optional env vars, and never silently pretends a feature works when it doesn't.
