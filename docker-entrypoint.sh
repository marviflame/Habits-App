#!/bin/sh
set -eu

SERVER_DIR="/app/server"
DATA_DIR="/app/data"
CLIENT_DIST_DIR="${CLIENT_DIST_DIR:-/app/client}"

export CLIENT_DIST_DIR
export DATABASE_URL="${DATABASE_URL:-file:/app/data/habits.db}"

mkdir -p "$DATA_DIR"
cd "$SERVER_DIR"

if [ -z "${SKIP_PRISMA_PUSH:-}" ] || [ "$SKIP_PRISMA_PUSH" != "1" ]; then
  echo "[entrypoint] Running prisma db push against $DATABASE_URL"
  if [ -x ./node_modules/.bin/prisma ]; then
    ./node_modules/.bin/prisma db push --skip-generate
  else
    npx prisma db push --skip-generate
  fi
  echo "[entrypoint] Prisma db push complete"
fi

if [ -d "$CLIENT_DIST_DIR" ]; then
  echo "[entrypoint] Serving client SPA from $CLIENT_DIST_DIR"
else
  echo "[entrypoint] WARNING: no client static at $CLIENT_DIST_DIR — API-only mode"
fi

echo "[entrypoint] Starting app: $*"
exec "$@"
