# Issue 01 — Lead email identity (form → save)

**Type**: AFK
**Blocked by**: None
**Parent**: `todo/prd-agency-agents-platform.md`
**User stories**: 1, 2, 6, 7

## What to build

End-to-end path for capturing Owner email (required) and phone (optional) on qualification. Database stores normalized email. New leads persist email and phone on the `leads` row.

## Acceptance criteria

- [ ] Migration adds `email`, `phone`, `updated_at` to `leads` with partial unique index on `(org_id, lower(email)) where email is not null`
- [ ] `LeadFormData` includes `email` (required) and `phone` (optional) in web and trigger types
- [ ] Lead form shows email and phone fields with validation
- [ ] `saveLead` stores normalized email and optional phone
- [ ] Tests cover email normalization and save payload

## Blocked by

None — start immediately.
