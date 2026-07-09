# Landing App

`@struggleforum/landing` is the public landing website for StruggleForum.

It is separate from the forum app. The landing app is mostly static content and can be deployed as a static site.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- nginx for Docker runtime
- GitHub Pages deployment script

## Pages

Current public pages:

- `/`
- `/about`
- `/book`
- `/coordination`
- `/contact`

The app uses shared UI components from `packages/ui`.

## Local Development

Run commands from the monorepo root:

```bash
cd struggleforum
```

Install dependencies:

```bash
npm install
```

Start the landing app:

```bash
npm run dev:landing
```

By default, Next.js starts on `http://localhost:3000`. If another app is already using the port, Next.js may ask to use a different one.

## Static Build

Build the landing app:

```bash
npm run build -w @struggleforum/landing
```

The app uses:

```ts
output: "export";
```

The static export is written to:

```text
apps/landing/out
```

## Docker

The landing Docker image is built from:

```text
apps/landing/Dockerfile
```

The Docker build:

1. Installs workspace dependencies.
2. Runs the Next.js static export build.
3. Copies `apps/landing/out` into nginx.

Run the full stack from the monorepo root:

```bash
docker compose up --build
```

Landing URL:

```text
http://localhost:3001
```

Inside the container, nginx serves the app on port `80`.

## GitHub Pages

The deployment script is:

```bash
npm run deploy -w @struggleforum/landing
```

For GitHub Pages, the app builds with:

```bash
GITHUB_PAGES=true
```

That enables the `/struggleforum` base path in `next.config.ts`.

Docker builds do not set `GITHUB_PAGES=true`, so Docker serves the app at `/`.

## Contact Form

The current contact form is frontend-only behavior. It does not send real messages to a backend or email provider yet.

Before treating it as production-ready, add one of:

- API endpoint and email provider.
- API endpoint and database storage.
- External form service.

Also add spam protection and error handling if the form becomes public.
