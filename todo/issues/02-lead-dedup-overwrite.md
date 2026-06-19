# Issue 02 — Lead dedup overwrite gate

**Type**: AFK
**Blocked by**: Issue 01
**Parent**: `todo/prd-agency-agents-platform.md`
**User stories**: 3, 4, 5

## What to build

Before running the Lead Qualifier agent, check whether a Lead with the same normalized email exists in the active Org. If yes and `overwrite` is not true, return 409 with company name and lead id — do not trigger the agent. On confirm (`overwrite: true`), run the agent and UPDATE the existing row (same `lead_id`, new result and `updated_at`). Form shows confirm dialog on 409.

## Acceptance criteria

- [ ] `findLeadByEmail(orgId, email)` returns existing lead or null
- [ ] POST /api/qualify returns 409 without triggering agent when duplicate and no overwrite
- [ ] POST /api/qualify with `overwrite: true` updates existing row; response id unchanged
- [ ] LeadForm shows overwrite confirm and resubmits with flag
- [ ] Tests cover 409 gate and overwrite path

## Blocked by

- Issue 01
