# Deployment design: trigger.dev + Vercel

**Date:** 2026-06-16
**Status:** approved

## Goal

Deploy the Lead Qualifier so that clicking "Analyze" in the browser triggers a real AI qualification via trigger.dev cloud and GPT-4o, with the frontend hosted on Vercel.

## AI backend decision

The trigger.dev cloud environment has no AWS credentials, so `qualifyWithClaude` (AWS Bedrock) will not run. The existing fallback in `claude.ts` routes to `qualifyWithGPT4o` when no AWS credentials are present. No code changes are needed — `OPENAI_API_KEY` is set as a trigger.dev environment secret.

## Data flow

```
Browser → POST /api/qualify (Vercel, server-side Route Handler)
        → tasks.triggerAndWait("qualify-lead", payload)
        → trigger.dev cloud executes qualify-lead task
        → qualifyWithGPT4o(lead) via OpenAI API
        → QualificationResult returned
        → Frontend renders result card
```

## Part 1: Deploy trigger.dev backend

1. Set `OPENAI_API_KEY` in trigger.dev project environment secrets (dashboard → Environment variables)
2. Run `cd backend && npx trigger.dev@latest deploy`

No code changes. The task ID `qualify-lead` and project ref `proj_isuuwzpvldmnhyekzhwv` are already correct.

## Part 2: Deploy frontend to Vercel

1. Import repo on Vercel, set root directory to `frontend/`
2. Set these environment variables in Vercel dashboard:
   - `TRIGGER_SECRET_KEY` = `tr_prod_...` (production key)
   - `TRIGGER_API_URL` = `https://api.trigger.dev`
   - `TRIGGER_PROJECT_REF` = `proj_isuuwzpvldmnhyekzhwv`
3. Deploy — Vercel runs `next build` automatically on push to `main`

The `TRIGGER_SECRET_KEY` is only read server-side (Next.js Route Handler) and never exposed to the browser.

## Security note

`frontend/.env.local` holds the prod trigger.dev key. Verify it is listed in `.gitignore` and not committed to the repo.

## What changes

- No frontend code changes
- No backend code changes
- trigger.dev gets `OPENAI_API_KEY` secret
- Vercel gets three env vars
- Backend task is deployed to trigger.dev cloud via CLI
