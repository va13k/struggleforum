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

The API currently uses bearer tokens.

Authenticated requests should include:

```http
Authorization: Bearer <token>
```

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

Run forum tests:

```bash
npm run test -w @struggleforum/forum
```

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
