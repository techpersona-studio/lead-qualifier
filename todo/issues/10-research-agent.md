# Issue 10 — Research agent (end-to-end)

**Type**: HITL
**Blocked by**: Issue 06
**Parent**: `todo/prd-company-spine-and-enrichment-agents.md`
**User stories**: 14, 15, 16, 17

## What to build

A Research agent that gathers external signals about a Company from the open web (Google reviews, reputation, mentions).

- **Decision step (why HITL):** pick the external source first — a SERP/search API (e.g. Serper/SerpAPI), a reviews API, or model-native web browsing. Record the choice (short ADR or PRD note) before implementing.
- Task side (mirror `generate-opportunity-map`): prompt (`prompts/research.ts`), types, validator, agent-lib, and a `research-company` trigger task that calls the chosen source and runs the agent.
- Output: findings with their sources (reviews summary, sentiment, notable mentions); kept distinct from Website Analysis (open web, not the Company's own site). No ICE scoring.
- Persistence: `research` table (org+company RLS incl. UPDATE), `sources jsonb`, newest-current.
- Web: `POST /api/research { companyId }`; a "Run research" action on the Company detail page; render latest research + history.
- Optional/non-blocking: thin web presence returns a flagged result.

## Acceptance criteria

- [ ] External source chosen and recorded before build
- [ ] `research-company` task runs the agent and validates output
- [ ] `/api/research` saves and returns research with sources; thin-presence handled with a flag
- [ ] Company detail can trigger and render latest Research + history
- [ ] Validator unit test (`trigger/__tests__/research.test.ts`) covers valid + malformed output

## Blocked by

- Issue 06
