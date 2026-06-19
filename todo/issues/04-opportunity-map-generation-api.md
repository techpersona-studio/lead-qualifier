# Issue 04 — Opportunity Map generation API

**Type**: AFK
**Blocked by**: Issue 03
**Parent**: `todo/prd-agency-agents-platform.md`
**User stories**: 9, 10, 11, 12, 13, 14, 19

## What to build

Opportunity Map agent prompt (injection-safe, reasoning before scores). Agent registry entry and `run-agent` trigger task. POST /api/opportunity-map: load Lead + qualification, scrape website, run agent, validate, save to `opportunity_maps`, return saved row.

## Acceptance criteria

- [ ] Prompt follows building-automation-prompts structure; transcript delimited as data
- [ ] `run-agent` task runs `opportunity-map` agent id
- [ ] API accepts `{ leadId, conversation }`; returns saved map with ranked opportunities
- [ ] Lead without website still succeeds with appropriate flag
- [ ] Route test mocks trigger + supabase

## Blocked by

- Issue 03
