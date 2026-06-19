# Issue 07 — Qualify flow on Company (append history, retire overwrite)

**Type**: AFK
**Blocked by**: Issue 06
**Parent**: `todo/prd-company-spine-and-enrichment-agents.md`
**User stories**: 6, 7, 9

## What to build

Move the qualify flow onto the Company spine and make Qualification append-only.

- `/api/qualify`: upsert the Company by normalized email (refresh identity, incl. latest industry/size), then append a new Qualification. Return `{ companyId, qualificationId, ...result }`.
- Remove the duplicate/overwrite gate: no `409 { exists }`, no `checkOnly`, no overwrite confirm modal in `LeadForm`.
- Persistence: `findCompanyByEmail` / `upsertCompany` and `saveQualification` (append) replacing `findLeadByEmail` / `saveLead`.
- Newest Qualification is the Company's current grade/score.

## Acceptance criteria

- [ ] Submitting an existing email appends a new Qualification (no overwrite, no modal)
- [ ] Company identity is refreshed on submit; per-ask fields land only on the Qualification
- [ ] Route returns `companyId` + `qualificationId`
- [ ] `qualify-route.test.ts` updated: upsert Company + append Qualification, agent still triggered once
- [ ] Overwrite-confirm code removed from `LeadForm`

## Blocked by

- Issue 06
