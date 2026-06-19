# Issue 09 — Website Analysis agent (end-to-end)

**Type**: AFK
**Blocked by**: Issue 06
**Parent**: `todo/prd-company-spine-and-enrichment-agents.md`
**User stories**: 10, 11, 12, 13

## What to build

A Website Analysis agent that critiques a Company's own live website on design and conversion expertise.

- Task side (mirror `generate-opportunity-map`): prompt (`prompts/website-analysis.ts`, injection-safe, follows building-automation-prompts), types, validator, agent-lib, and an `analyze-website` trigger task that scrapes the site (`lib/website.ts`) and runs the agent.
- Output: structured findings — what works, what's underperforming, prioritized improvements — without ICE scoring (ICE stays Opportunity-Map-only).
- Persistence: `website_analyses` table (org+company RLS incl. UPDATE), newest-current.
- Web: `POST /api/website-analysis { companyId }`; a "Run website analysis" action on the Company detail page; render the latest analysis + history.
- Optional/non-blocking: a Company with no website returns a flagged, empty-ish result.

## Acceptance criteria

- [ ] `analyze-website` task runs the agent and validates output against the schema
- [ ] Prompt treats scraped content as data only (no embedded-instruction following)
- [ ] `/api/website-analysis` saves and returns the analysis; Company with no website is handled with a flag
- [ ] Company detail can trigger and render the latest Website Analysis + history
- [ ] Validator unit test (`trigger/__tests__/website-analysis.test.ts`) covers valid + malformed output

## Blocked by

- Issue 06
