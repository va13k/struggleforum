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

ARG NEXT_PUBLIC_BASE_PATH=""

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY . .

RUN npm run build -w @struggleforum/landing

FROM nginx:1.27-alpine AS runner

COPY apps/landing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/landing/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
