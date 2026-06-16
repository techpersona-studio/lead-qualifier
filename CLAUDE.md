# AI Lead Qualifier

## Project overview

AI-powered lead qualifier. User fills a form → trigger.dev workflow runs → Claude Sonnet 4.6 scores the lead → result shown in the UI.

## WAT framework

| Layer | Folder | Purpose |
|-------|--------|---------|
| W — Workflows | `Workflows/` | Prompt templates, scoring rubrics, workflow design docs |
| A — Agent | (this file) | Claude Code — the AI assistant driving development |
| T — Tools | `Tools/` | Shell scripts and dev utilities |

## Architecture

```
Frontend (Vercel)           Backend (trigger.dev)
Next.js App Router    →     qualify-lead task
  /api/qualify route  →       → calls Claude Sonnet 4.6 (GPT-4o fallback)
  LeadForm component          → returns QualificationResult
  QualificationResult         ← polled by frontend
```

## Tech stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, deployed on Vercel via GitHub
- **Backend**: trigger.dev v3, TypeScript
- **AI**: Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`) with OpenAI GPT-4o fallback

## Key commands

```bash
# Frontend dev
cd frontend && npm run dev

# Backend dev (trigger.dev local)
cd backend && npx trigger.dev@latest dev

# Run both
bash Tools/dev.sh

# Test a lead via CLI
cd backend && npx ts-node Tools/test-workflow.ts
```

## Environment variables

### frontend/.env.local
```
TRIGGER_API_KEY=tr_dev_...
TRIGGER_API_URL=https://api.trigger.dev
TRIGGER_PROJECT_REF=proj_...
```

### backend/.env
```
ANTHROPIC_API_KEY=sk-ant-...   # primary — if missing, falls back to GPT-4o
OPENAI_API_KEY=sk-...          # fallback — only needed if ANTHROPIC_API_KEY is absent
```

## Lead fields

| Field | Type | Required |
|-------|------|----------|
| companyName | string | yes |
| contactName | string | yes |
| industry | string | yes |
| companySize | string | yes |
| budgetRange | string | yes |
| useCase | string | yes |
| websiteUrl | string | no |

## Adding or modifying the qualification logic

1. Edit `Workflows/lead-qualifier-prompt.md` to change the system prompt
2. Edit `Workflows/scoring-rubric.md` to change scoring criteria
3. Update `backend/lib/claude.ts` to reflect prompt changes
4. Update `backend/lib/scorer.ts` if the output schema changes

## Deployment

- **Frontend**: Push to `main` → Vercel auto-deploys. Set env vars in Vercel dashboard.
- **Backend**: `cd backend && npx trigger.dev@latest deploy`
