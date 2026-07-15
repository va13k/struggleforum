# Forum App

`@struggleforum/forum` is the dynamic forum application.

It currently contains the backend/API implementation for the forum. The browser-facing forum UI is still mostly missing.

## Stack

- Next.js App Router
- React
- TypeScript
- Prisma
- PostgreSQL
- Zod
- Vitest

## Responsibilities

The forum app owns:

- Authentication and session lifecycle.
- Account profile and password updates.
- User lookup.
- Categories.
- Posts.
- Comments and replies.
- Likes.
- Notifications.
- Admin and moderation actions.
- Prisma schema and migrations.

## Current API Surface

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Account:

- `GET /api/account/profile`
- `PATCH /api/account/profile`
- `PATCH /api/account/password`

Forum resources:

- `GET /api/categories`
- `POST /api/categories`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/lock`
- `POST /api/posts/:id/unlock`
- `GET /api/posts/:id/comments`
- `POST /api/posts/:id/comments`
- `PUT /api/comments/:id`
- `DELETE /api/comments/:id`
- `POST /api/comments/:id/lock`
- `POST /api/comments/:id/unlock`
- `POST /api/likes`
- `DELETE /api/likes/:id`
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `GET /api/users/:id`

Admin:

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/role`
- `DELETE /api/admin/posts/:id`
- `DELETE /api/admin/comments/:id`

Health:

- `GET /api/health`

## Authentication

The API uses an httpOnly session cookie, not a bearer token. `POST /api/auth/login`
and `POST /api/auth/register` set a `sf_session` cookie (httpOnly, `SameSite=Lax`,
`Secure` in production) on the response; the browser sends it automatically on
subsequent same-origin requests. The response body only ever contains `{ user }` -
the raw session token is never exposed to client-side JavaScript, which closes off
token theft via XSS. `POST /api/auth/logout` clears the cookie.

Cross-origin callers (a different origin than the forum app itself, e.g. a separate
frontend) must set `CORS_ALLOWED_ORIGINS` to include their origin and send requests
with `credentials: "include"` - the cookie is `SameSite=Lax`, so it's only sent on
same-site requests and top-level navigations, not on cross-site fetches from an
origin outside the same site.

Sessions expire after two hours of inactivity. Each authenticated request refreshes session activity.

## Local Development

Run commands from the monorepo root:

```bash
cd struggleforum
```

Start PostgreSQL:

```bash
docker compose up -d db
```

Install dependencies:

```bash
npm install
```

Create `apps/forum/.env` for native development:

```bash
DATABASE_URL="postgresql://struggleforum:struggleforum@localhost:5432/struggleforum?schema=public"
CORS_ALLOWED_ORIGINS="http://localhost:3001"
```

Run migrations:

```bash
npm exec -w @struggleforum/forum prisma migrate dev
```

Seed default categories and a local admin user:

```bash
npm run seed:forum
```

Start the forum app:

```bash
npm run dev:forum
```

## Docker

The forum Docker image is built from:

```text
apps/forum/Dockerfile
```

The image uses Next.js standalone output:

```ts
output: "standalone";
```

Docker Compose also includes a one-shot migration service:

```text
forum-migrate
```

This service runs:

```bash
prisma migrate deploy
```

Then the `forum` service starts.

Run the full Docker stack from the monorepo root:

```bash
docker compose up --build
```

Forum URL:

```text
http://localhost:3000
```

## Testing

Run forum unit tests (mocked Prisma/session, no database required):

```bash
npm run test -w @struggleforum/forum
```

Run forum integration tests (exercises the real Postgres schema - DB-level
constraints, cascade behavior, migrations):

```bash
# Requires the dev Postgres container running (docker compose up -d db)
# and TEST_DATABASE_URL set in apps/forum/.env, pointing at a database
# whose name ends in "_test" (see .env.example).
npm run test:integration -w @struggleforum/forum
```

This first runs `scripts/setup-test-db.mjs`, which creates the test database
if it doesn't already exist and applies all Prisma migrations to it, then
runs the integration suite (`**/*.integration.test.ts`). Each test truncates
all tables beforehand via `resetDatabase()` (`src/test/integration/reset-database.ts`),
which refuses to run against any database whose name doesn't end in `_test` -
it can never accidentally wipe your dev database.

Run forum lint:

```bash
npm run lint -w @struggleforum/forum
```

Build forum:

```bash
npm run build -w @struggleforum/forum
```

Seed local development data:

```bash
npm run seed:forum
```

If native builds fail due to missing modules, reinstall dependencies from the monorepo root:

```bash
npm install
```

## Important Gaps

The backend is ahead of the frontend.

Missing product UI includes:

- Login/register pages.
- Forum feed.
- Post detail page.
- Create/edit post pages.
- Comment/reply UI.
- User profile page.
- Account settings.
- Notifications UI.
- Admin moderation UI.
