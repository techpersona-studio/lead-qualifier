#!/usr/bin/env bash
#
# ship.sh — commit + push everything, then redeploy the backend task.
#
# Frontend: pushing to main triggers Vercel's auto-deploy.
# Backend:  the trigger.dev task is deployed separately here.
#
# Usage:
#   ./ship.sh "your commit message"   # commit with this message
#   ./ship.sh                          # commit with a timestamped default
#
set -euo pipefail

cd "$(dirname "$0")"

# ── 1. Commit and push (Vercel picks up the frontend) ──────────────
if [[ -n "$(git status --porcelain)" ]]; then
  MSG="${1:-chore: ship $(date '+%Y-%m-%d %H:%M')}"
  echo "→ Committing: $MSG"
  git add -A
  git commit -m "$MSG"
else
  echo "→ No changes to commit."
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "→ Pushing $BRANCH (Vercel auto-deploys the frontend)…"
git push origin "$BRANCH"

# ── 2. Redeploy the backend task to trigger.dev ────────────────────
echo "→ Deploying backend task to trigger.dev…"
( cd backend && npx trigger.dev@latest deploy )
# npx trigger.dev@latest deploy	prod (default)
# npx trigger.dev@latest deploy --env staging	staging
# npx trigger.dev@latest dev	dev (local, the one you run while developing)

echo "✓ Shipped. Frontend via Vercel, backend on trigger.dev."
