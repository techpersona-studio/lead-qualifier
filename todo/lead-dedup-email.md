# Lead dedup by email

**Status**: Open
**Priority**: Medium
**Effort**: M (1/2-2 days)
**Created**: 2026-06-19
**Owner**: AI + user
**Domain**: fullstack
**Links**: `CONTEXT.md` (Lead, Owner)
**Dependencies**: None
**Review mode**: per-step

---

## User Approval

**Approach Approved By**: _<pending>_
**Approval Date**: _<pending>_
**Approval Notes**: _Design resolved via grill 2026-06-19._

---

## Problem Statement

- **Symptom**: The same company can be qualified many times, creating duplicate leads with conflicting scores.
- **Root cause**: There's no unique key on a lead. The form has no email, and `saveLead` always inserts.
- **Impact**: Messy history, no single source of truth per prospect, wasted Claude calls re-scoring the same business.
- **Evidence**: `web/lib/leads.ts` (`insert` only), `supabase/migrations/0001_init.sql` (no email/unique constraint), `trigger/types/lead.ts` (`LeadFormData` has no email).

## Proposed Approaches

### Approach A — Email as the unique key, overwrite in place, confirm before re-run

Add `email` (required) and `phone` (optional) to the lead. Unique per org on `lower(email)`. On submit, check for an existing email first; if found, return a conflict without running the agent and show a confirm dialog. On confirm, run the agent and UPDATE the existing row.

- Pro: One row per prospect, stable `lead_id` for attached opportunity maps, no wasted Claude call on cancel.
- Con: Existing rows have no email; needs a nullable column + partial unique index.

### Approach B — Dedup on company name

- Pro: Matches the original "this company" wording.
- Con: Company-name matching is fuzzy; rejected in the grill.

## Selected Approach

**Picked**: Approach A

Email is a clean, normalizable key; company names aren't. Overwrite-in-place keeps one row per prospect and a stable `lead_id`. Checking before the agent runs avoids burning a Claude call when the user cancels the overwrite. Accepted con: no qualification history (chosen deliberately).

---

## Planned Approach

### Technical Strategy

`email` is normalized (`trim().toLowerCase()`) before storage and lookup. Uniqueness is enforced per org with a partial unique index so legacy rows without email don't block the migration. `saveLead` becomes an upsert keyed on `(org_id, email)`.

### Implementation Steps

- [ ] **Step 1: Migration.** Add `email text`, `phone text`, `updated_at timestamptz default now()` to `leads`. Add `create unique index on leads (org_id, lower(email)) where email is not null;`.
  - Files: `supabase/migrations/0006_lead_email_dedup.sql`
- [ ] **Step 2: Types + form.** Add `email` (required) and `phone` (optional) to `LeadFormData` and the form UI with validation.
  - Files: `web/types/lead.ts`, `trigger/types/lead.ts`, `web/components/LeadForm.tsx`
- [ ] **Step 3: Conflict check before run.** In `POST /api/qualify`, normalize email, look up an existing lead in the active org. If found and `overwrite` is not set, return `409 { exists: true, company, leadId }` without triggering the agent.
  - Files: `web/app/api/qualify/route.ts`, `web/lib/leads.ts` (`findLeadByEmail`)
- [ ] **Step 4: Upsert on save.** Change `saveLead` to UPDATE the existing row when email matches, else INSERT. Set `updated_at`.
  - Files: `web/lib/leads.ts`
- [ ] **Step 5: Confirm dialog.** On a 409, show "A lead for {company} ({email}) already exists. Rerun and overwrite?" On confirm, resubmit with `overwrite: true`.
  - Files: `web/components/LeadForm.tsx`
- [ ] **Step 6: Docs.** Note email-keyed dedup in the README and confirm `CONTEXT.md` (already updated).
  - Files: `README.md`

---

## Success Criteria

**Automated checks:**
- [ ] `cd web && npm run build` passes.
- [ ] Inserting two leads with the same email in one org fails at the DB (unique index).

**Behavior:**
- [ ] Submitting an existing email shows the confirm dialog and does NOT run the agent until confirmed.
- [ ] Confirming overwrites the existing row (same `lead_id`), updating result, score, grade, `updated_at`.
- [ ] The same email in a different org creates a separate lead (org-scoped uniqueness).
- [ ] Existing legacy rows (no email) are unaffected by the migration.

**Manual verification:**
- [ ] Qualify a new email, re-submit it, confirm overwrite, verify only one row exists.

## Wire Compatibility

- `POST /api/qualify` request gains optional `overwrite: boolean`; response adds a `409 { exists, company, leadId }` case. `LeadFormData` gains `email` (required) and `phone` (optional), affecting any other caller.

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation | Reviewer / QA verification |
|------|--------|------------|------------|---------------------------|
| Migration breaks on legacy rows without email | High | Med | Nullable column + partial unique index | Run migration on a copy with existing rows |
| Case/whitespace duplicates slip through | Med | Med | Normalize before store + index on `lower(email)` | Submit ' Joe@X.com ' then 'joe@x.com' |
| Overwrite races (two members at once) | Low | Low | DB unique index is the backstop | Concurrent submit test |

---

## Implementation Notes

### Decisions Made
- Dedup key = email, normalized lowercased, unique per org.
- Email required, phone optional.
- Overwrite in place (no history); same `lead_id` preserved.
- Conflict checked before the agent runs.

## Completion Summary

_(Filled when complete.)_

## Documentation Updated

- `CONTEXT.md` — Lead now identified by Owner email; re-qualifying overwrites in place.
