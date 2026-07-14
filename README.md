# StruggleForum

StruggleForum is a monorepo with a forum backend/API application, a public landing website, and shared packages.

The npm workspace root is the nested `struggleforum/` directory:

```text
.
├── README.md
├── mvp_requirements/
└── struggleforum/
    ├── apps/
    │   ├── forum/
    │   └── landing/
    ├── packages/
    ├── docker-compose.yml
    └── package.json
```

## Applications

### Forum

`struggleforum/apps/forum` is the dynamic forum application.

Current state:

- Next.js app with API routes.
- Prisma/PostgreSQL backend.
- Authentication, sessions, posts, comments, likes, categories, notifications, account endpoints, and admin endpoints.
- No complete browser forum UI yet.

See [Forum README](struggleforum/apps/forum/README.md).

### Landing

`struggleforum/apps/landing` is the public marketing/static website.

Current state:

- Next.js static export app.
- Public pages for home, about, book, coordination, and contact.
- Docker image serves the exported site with nginx.
- GitHub Pages deployment script is available.

See [Landing README](struggleforum/apps/landing/README.md).

## Requirements

For the Docker-first workflow:

- Docker
- Docker Compose

For the native development workflow:

- Node.js
- npm
- Docker for PostgreSQL

PostgreSQL does not need to be installed locally. Prisma does not need to be installed globally; it is installed through the project dependencies.

## Quick Start With Docker

From the npm workspace root:

```bash
cd struggleforum
docker compose up --build
```

This starts:

- `db`: PostgreSQL 16
- `forum-migrate`: one-shot Prisma migration service
- `forum`: forum app on `http://localhost:3000`
- `landing`: landing app on `http://localhost:3001`

Check the containers:

```bash
docker compose ps
```

Expected state:

- `db` is running and healthy.
- `forum` is running.
- `landing` is running.
- `forum-migrate` exited successfully with code `0`.

Test the running apps:

```bash
curl http://localhost:3001
curl http://localhost:3000/api/health
curl http://localhost:3000/api/categories
```

Stop the stack:

```bash
docker compose down
```

Stop the stack and remove local database data:

```bash
docker compose down -v
```

Use `-v` carefully because it deletes the local PostgreSQL volume.

## Native Development Workflow

Use this mode when actively developing with local Node.js and Next.js hot reload.

Start only PostgreSQL:

```bash
cd struggleforum
docker compose up -d db
```

Install dependencies:

```bash
npm install
```

Run forum migrations:

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

Start the landing app in another terminal:

```bash
npm run dev:landing
```

By default, both apps try to use port `3000`. If one app is already running, Next.js will usually ask to use another port.

## Environment Variables

Docker Compose provides default PostgreSQL settings if values are not set in `.env`.

Useful variables:

```bash
POSTGRES_USER=struggleforum
POSTGRES_PASSWORD=struggleforum
POSTGRES_DB=struggleforum
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

For native forum development, the forum app also needs `DATABASE_URL`, usually in `struggleforum/apps/forum/.env`:

```bash
DATABASE_URL="postgresql://struggleforum:struggleforum@localhost:5432/struggleforum?schema=public"
CORS_ALLOWED_ORIGINS="http://localhost:3001"
```

Do not commit real secrets.

## Common Commands

Run from `struggleforum/`.

```bash
npm run dev:forum
npm run dev:landing
npm run build
npm run test
npm run typecheck
```

Docker checks:

```bash
docker compose config --quiet
docker compose build
docker compose up --build
```

Prisma commands:

```bash
npm exec -w @struggleforum/forum prisma generate
npm exec -w @struggleforum/forum prisma migrate dev
npm exec -w @struggleforum/forum prisma migrate deploy
npm run seed:forum
```