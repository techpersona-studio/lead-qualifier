#!/usr/bin/env bash
set -e

echo "Starting frontend (Next.js on :3000)..."
(cd "$(dirname "$0")/../frontend" && npm run dev) &

echo "Starting backend (trigger.dev)..."
(cd "$(dirname "$0")/../backend" && npx trigger.dev@latest dev) &

wait
