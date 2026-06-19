# Issue 08 — Company detail page

**Type**: AFK
**Blocked by**: Issue 07
**Parent**: `todo/prd-company-spine-and-enrichment-agents.md`
**User stories**: 22, 23

## What to build

One Company detail page that replaces the per-lead detail view and gathers everything about a Company.

- Route `/companies/[id]` (or repurpose `/leads/[id]`) showing: identity header, **Qualification history** (newest first, current highlighted), existing **Opportunity Maps**, and placeholders/sections for Website Analyses and Research (populated by issues 09/10).
- History list at `/companies` (or `/leads`) keyed by Company, newest activity first.
- Re-home the Opportunity Maps section already built on the lead detail page onto the Company.

## Acceptance criteria

- [ ] Company detail shows identity + full Qualification history with the current one marked
- [ ] Existing Opportunity Maps render under the Company (carried over from lead detail)
- [ ] List page is Company-scoped and links to Company detail
- [ ] No dead links to the retired `/leads/[id]` shape

## Blocked by

- Issue 07
