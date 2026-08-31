FROM node:20-alpine AS deps-client
WORKDIR /app/client
RUN apk add --no-cache libc6-compat python3 make g++
COPY client/package.json client/package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

FROM node:20-alpine AS build-client
WORKDIR /app/client
COPY --from=deps-client /app/client/node_modules ./node_modules
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS deps-server
WORKDIR /app/server
RUN apk add --no-cache openssl python3 make g++
COPY server/package.json server/package-lock.json* ./
COPY server/prisma/ ./prisma/
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi
RUN ./node_modules/.bin/prisma generate

FROM node:20-alpine AS build-server
WORKDIR /app/server
COPY --from=deps-server /app/server/node_modules ./node_modules
COPY server/ ./
RUN rm -rf dist && ./node_modules/.bin/tsc --project tsconfig.json

FROM node:20-alpine AS server-prod-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
COPY server/prisma/ ./prisma/
ENV NODE_ENV=production
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev --no-audit --no-fund; \
    else \
      npm install --omit=dev --no-audit --no-fund; \
    fi
RUN ./node_modules/.bin/prisma generate

FROM node:20-alpine AS runtime
LABEL maintainer="Habits App"
LABEL description="Habits tracker - Express API + React SPA served from one container"
RUN apk add --no-cache tini openssl && \
  addgroup -S app && adduser -S app -G app

WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

ENV JWT_SECRET=replace-with-a-strong-secret-before-production
ENV JWT_EXPIRES_IN=7d
ENV CORS_ORIGIN=http://localhost:4000,http://127.0.0.1:4000
ENV DATABASE_URL=file:/app/data/habits.db
ENV CLIENT_DIST_DIR=/app/client

COPY server/prisma/ ./prisma/
COPY --from=server-prod-deps /app/server/node_modules ./node_modules
COPY --from=build-server /app/server/dist ./dist
COPY --from=build-client /app/client/dist /app/client

RUN mkdir -p /app/data && chown -R app:app /app

USER app
VOLUME ["/app/data"]
EXPOSE 4000

COPY --chown=app:app docker-entrypoint.sh /app/docker-entrypoint.sh
USER root
RUN chmod +x /app/docker-entrypoint.sh
USER app

ENTRYPOINT ["/sbin/tini", "--", "/app/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
