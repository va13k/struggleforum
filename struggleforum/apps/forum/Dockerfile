# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY apps/forum/package.json apps/forum/package.json
COPY apps/landing/package.json apps/landing/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/forum/node_modules ./apps/forum/node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY . .

RUN npm exec -w @struggleforum/forum prisma generate
RUN npm run build -w @struggleforum/forum

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/forum/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/forum/.next/static ./apps/forum/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/forum/server.js"]
