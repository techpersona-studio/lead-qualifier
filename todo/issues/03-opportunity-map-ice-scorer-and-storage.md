# Issue 03 — Opportunity Map ICE scorer + storage

**Type**: AFK
**Blocked by**: Issue 02
**Parent**: `todo/prd-agency-agents-platform.md`
**User stories**: 15, 19, 20

## What to build

Database table `opportunity_maps` with org-scoped RLS. Types and zod schema for Opportunity Map output. Server-side ICE module: from model sub-scores compute `iceScore = (impact + confidence + ease) / 3`, band A-D (A ≥ 8.0, B 6.5–7.9, C 4.5–6.4, D < 4.5), sort and assign rank.

## Acceptance criteria

- [ ] Migration creates `opportunity_maps` with FK to `leads`, RLS mirroring `leads`
- [ ] Zod rejects out-of-range sub-scores
- [ ] Scorer computes iceScore/grade/rank deterministically; ignores model-supplied totals if present
- [ ] Unit tests for scorer edge cases

## Blocked by

- Issue 02 (stable lead_id for FK)
