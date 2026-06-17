# AI Lead Qualifier

## Project overview

AI-powered lead qualifier. User fills a form → trigger.dev task runs → the task scrapes the lead's website, then Claude Sonnet 4.6 (via AWS Bedrock) scores the lead → result shown in the UI.

## Architecture

```
Frontend (Vercel)              Backend (trigger.dev)
Next.js App Router       →     qualify-lead task
  /api/qualify route     →       → scrapes lead website (lib/website.ts)
  LeadForm component             → calls Claude Sonnet 4.6 via Bedrock (GPT-4o fallback)
  QualificationResult      ←     → returns QualificationResult (polled by the route)
```

The `/api/qualify` route triggers the task and polls for the result with `runs.poll`.

## Tech stack

- **Frontend**: Next.js 15 (App Router), TypeScript, deployed on Vercel
- **Backend**: trigger.dev v3, TypeScript, run with `tsx`
- **AI**: Claude Sonnet 4.6 (`anthropic.claude-sonnet-4-6`) via AWS Bedrock, with OpenAI `gpt-4o-mini` fallback

## Key commands

```bash
# Frontend dev (Next.js on :3000)
cd frontend && npm run dev

# Backend dev (trigger.dev local)
cd backend && npx trigger.dev@latest dev

# Deploy backend task to trigger.dev
cd backend && npx trigger.dev@latest deploy

# Deploy frontend to Vercel (or just push to main)
cd frontend && npx vercel --prod
```

## Environment variables

### backend/.env
```
# AI provider — backend uses Claude via AWS Bedrock when AWS creds are present,
# otherwise falls back to OpenAI GPT-4o-mini.
AWS_ACCESS_KEY_ID=...        # presence of AWS creds selects Claude/Bedrock
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_PROFILE=...              # alternative to access keys
OPENAI_API_KEY=sk-...        # fallback — used when no AWS creds are set
TRIGGER_PROJECT_REF=proj_...
```

### frontend/.env.local
```
TRIGGER_SECRET_KEY=tr_dev_...
TRIGGER_API_URL=https://api.trigger.dev
TRIGGER_PROJECT_REF=proj_...
```

## Lead fields

| Field | Type | Required |
|-------|------|----------|
| companyName | string | yes |
| contactName | string | yes |
| industry | string | yes |
| companySize | string | yes |
| budgetRange | string | yes |
| urgency | string | yes |
| useCase | string | yes |
| websiteUrl | string | no |

## Scoring logic

The system prompt and scoring rubric live in code, not in separate docs:

- **`backend/prompts/lead-qualifier.ts`** — the live system prompt the model runs on, bundled into the task at deploy time. Edit this to change scoring.
- **`backend/lib/website.ts`** — fetches and extracts the lead's website text, fed into the prompt for context.
- **`backend/lib/scorer.ts`** + **`backend/types/lead.ts`** — output schema and Zod validation. Update if the result shape changes.
- **`docs/memory/scoring-philosophy.md`** — the rationale behind the scoring (effort-to-value budget, size-inferred authority, agency positioning). Read this before changing scoring.

After editing scoring, redeploy the backend: `cd backend && npx trigger.dev@latest deploy`.

## Deployment

- **Frontend**: push to `main` → Vercel auto-deploys. Set env vars in the Vercel dashboard.
- **Backend**: `cd backend && npx trigger.dev@latest deploy`. Set env vars in the trigger.dev dashboard (production environment).

Pushing to `main` does **not** deploy the backend. The website-scraping and scoring logic run inside the trigger.dev task, so a prompt change is only live after a `trigger.dev deploy`.
