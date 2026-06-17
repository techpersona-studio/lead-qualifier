# AI Lead Qualifier

Score inbound leads automatically. A prospect fills out a form, and within seconds you get a 0-100 score, an A-D grade, a recommended action, and a breakdown across fit, intent, budget, and urgency.

Behind the form, a [trigger.dev](https://trigger.dev) task scrapes the lead's website for context, then Claude Sonnet 4.6 scores the lead against an agency-tuned rubric.

## How it works

```
Frontend (Vercel)              Backend (trigger.dev)
Next.js form            →     qualify-lead task
  /api/qualify route     →       1. scrape lead website for context
                                 2. score with Claude Sonnet 4.6 (Bedrock)
  result card            ←       3. return score, grade, breakdown
```

The `/api/qualify` route triggers the task and polls until it completes, then renders the result.

## Tech stack

- **Frontend**: Next.js 15 (App Router), TypeScript, deployed on Vercel
- **Backend**: trigger.dev v3, TypeScript
- **AI**: Claude Sonnet 4.6 via AWS Bedrock, with OpenAI GPT-4o-mini as a fallback

## Get started

### 1. Prerequisites

- Node.js 20+
- A [trigger.dev](https://trigger.dev) account and project
- AWS credentials with Bedrock access (for Claude), or an OpenAI API key (for the fallback)

### 2. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 3. Set environment variables

Copy the example files and fill them in:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

**backend/.env**
```
AWS_ACCESS_KEY_ID=...        # presence of AWS creds selects Claude via Bedrock
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
OPENAI_API_KEY=sk-...        # fallback, used when no AWS creds are set
TRIGGER_PROJECT_REF=proj_...
```

**frontend/.env.local**
```
TRIGGER_SECRET_KEY=tr_dev_...
TRIGGER_API_URL=https://api.trigger.dev
TRIGGER_PROJECT_REF=proj_...
```

### 4. Run locally

In two terminals:

```bash
# Terminal 1 — frontend on http://localhost:3000
cd frontend && npm run dev

# Terminal 2 — trigger.dev task runner
cd backend && npx trigger.dev@latest dev
```

Open http://localhost:3000, fill out the form, and submit. The trigger.dev dashboard shows a full log of each run: the scraped website text, the exact prompt sent to the model, and the raw response.

## Deploy

The frontend and backend deploy separately.

```bash
# Backend — deploy the task to trigger.dev
cd backend && npx trigger.dev@latest deploy

# Frontend — push to main (Vercel auto-deploys) or deploy directly
git push origin main
# or
cd frontend && npx vercel --prod
```

Set production env vars in the Vercel dashboard (frontend) and the trigger.dev dashboard (backend).

> **Pushing to `main` deploys only the frontend.** The scoring and scraping run inside the trigger.dev task, so prompt changes go live only after `trigger.dev deploy`.

## Change the scoring

The scoring logic lives in code:

| What | Where |
|------|-------|
| System prompt the model runs on | `backend/prompts/lead-qualifier.ts` |
| Website scrape feeding context | `backend/lib/website.ts` |
| Output schema and validation | `backend/lib/scorer.ts`, `backend/types/lead.ts` |
| The rationale behind the scoring | `docs/memory/scoring-philosophy.md` |

Read `docs/memory/scoring-philosophy.md` first, edit the prompt, then redeploy the backend.
