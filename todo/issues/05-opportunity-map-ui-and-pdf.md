# Issue 05 — Opportunity Map UI + print PDF

**Type**: AFK
**Blocked by**: Issue 04
**Parent**: `todo/prd-agency-agents-platform.md`
**User stories**: 8, 16, 17, 18

## What to build

Nav entry for two apps (Lead Qualifier, Opportunity Map). Generator page: Lead dropdown (org leads, newest first), transcript paste + file drop, generate button. Report page at `/opportunity-map/[id]` with ranked cards, summary, recommended first move, flags. Print-styled layout + Download PDF via browser print.

## Acceptance criteria

- [ ] Nav switches between qualifier and opportunity map apps
- [ ] Member can generate a map from Lead + transcript end-to-end in browser
- [ ] Report renders all opportunity fields including expectedOutcome and ICE grade
- [ ] Print/PDF produces clean standalone layout
- [ ] Browser verification via DevTools MCP

## Blocked by

- Issue 04
