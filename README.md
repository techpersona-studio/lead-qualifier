# AI Lead Qualifier

Score inbound leads automatically. A prospect fills out a form, and within seconds you get a 0-100 score, an A-D grade, a recommended action, and a breakdown across fit, intent, budget, and urgency.

Behind the form, a [trigger.dev](https://trigger.dev) task scrapes the lead's website for context, then Claude Sonnet 4.6 scores the lead against an agency-tuned rubric. Results are saved to a per-org history so your team can review and revisit past leads.

## How it works

```
web/ (Vercel)                  trigger/ (trigger.dev)
Next.js form            →     qualify-lead task
  /api/qualify route     →       1. scrape lead website for context
                                 2. score with Claude Sonnet 4.6 (Bedrock)
  result card            ←       3. return score, grade, breakdown
  save to Supabase       ←       (API route persists result after polling)
```

The `/api/qualify` route triggers the task, polls until it completes, saves the result to Supabase, then renders the result.

## Tech stack

- **Web app**: Next.js 15 (App Router), TypeScript, deployed on Vercel
- **Task runner**: trigger.dev v3, TypeScript
- **AI**: Claude Sonnet 4.6 via AWS Bedrock, with OpenAI GPT-4o-mini as a fallback
- **Auth + database**: Supabase (`@supabase/ssr`) — org-scoped lead history, invite-only auth

## Directory structure

```
web/       Next.js app — UI, API routes, auth middleware
trigger/   trigger.dev async task — website scrape + AI scoring
docs/      Architecture decisions, scoring philosophy
todo/      Implementation plans
```

## Get started

### 1. Prerequisites

- Node.js 20+
- A [trigger.dev](https://trigger.dev) account and project
- A [Supabase](https://supabase.com) project
- AWS credentials with Bedrock access (for Claude), or an OpenAI API key (for the fallback)

### 2. Install dependencies

```bash
cd web && npm install
cd ../trigger && npm install
```

### 3. Set environment variables

Copy the example files and fill them in:

```bash
cp trigger/.env.example trigger/.env
cp web/.env.local.example web/.env.local
```

**trigger/.env**
```
AWS_ACCESS_KEY_ID=...        # presence of AWS creds selects Claude via Bedrock
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
OPENAI_API_KEY=sk-...        # fallback, used when no AWS creds are set
TRIGGER_PROJECT_REF=proj_...
```

**web/.env.local**
```
TRIGGER_SECRET_KEY=tr_dev_...
TRIGGER_API_URL=https://api.trigger.dev
TRIGGER_PROJECT_REF=proj_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only, never exposed to browser
```

### 4. Run locally

In two terminals:

```bash
# Terminal 1 — web app on http://localhost:3000
cd web && npm run dev

# Terminal 2 — trigger.dev task runner
cd trigger && npx trigger.dev@latest dev
```

Open http://localhost:3000. You'll land on the login page — sign in with the credentials from your Supabase Auth dashboard.

## Deploy

The web app and task deploy separately.

```bash
# Task — deploy to trigger.dev
cd trigger && npx trigger.dev@latest deploy

# Web app — push to main (Vercel auto-deploys) or deploy directly
git push origin main
# or
cd web && npx vercel --prod
```

Set production env vars in the Vercel dashboard (web app) and the trigger.dev dashboard (task).

> **Pushing to `main` deploys only the web app.** The scoring and scraping run inside the trigger.dev task, so prompt changes go live only after `trigger.dev deploy`.

### Ship everything at once

`ship.sh` commits, pushes (Vercel picks up the web app), and redeploys the task in one step:

```bash
./ship.sh "your commit message"   # commit with this message
./ship.sh                          # commit with a timestamped default
```

## Change the scoring

The scoring logic lives in code:

| What | Where |
|------|-------|
| System prompt the model runs on | `trigger/prompts/lead-qualifier.ts` |
| Website scrape feeding context | `trigger/lib/website.ts` |
| Output schema and validation | `trigger/lib/scorer.ts`, `trigger/types/lead.ts` |
| The rationale behind the scoring | `docs/memory/scoring-philosophy.md` |

Read `docs/memory/scoring-philosophy.md` first, edit the prompt, then redeploy the task.

## Auth and teams

Access is invite-only — there's no public sign-up. An org admin invites teammates by email from `/settings/members`. Supabase sends the invite email; the link lands the new member directly in the app.

Leads are org-scoped: everyone on the team sees the same history. See `docs/adr/0001-org-scoped-leads.md` for the rationale.
