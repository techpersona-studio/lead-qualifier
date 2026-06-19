# Issue 11 — Company State + isClient

**Type**: AFK
**Blocked by**: Issue 06
**Parent**: `todo/prd-company-spine-and-enrichment-agents.md`
**User stories**: 18, 19, 20, 21

## What to build

Surface and advance the Company's pipeline State, and let Members mark a Company as a Client.

- State values: `submitted → qualified → analyzed → call-prepped → call-done → mapped`. Advance the State as each step finishes (qualify → `qualified`; Website Analysis or Research → `analyzed`; Opportunity Map → `mapped`).
- `is_client` toggle on the Company detail page; render a Client badge in the list and detail.
- Keep State and Client independent: a `mapped` Company may or may not be a Client.

## Acceptance criteria

- [ ] State advances automatically as qualify / analysis / map steps complete
- [ ] Company detail shows current State; list shows State + Client badge
- [ ] Member can toggle `is_client`; it persists and is independent of State
- [ ] No step downgrades State (monotonic forward, or explicit rule documented)

## Blocked by

- Issue 06
