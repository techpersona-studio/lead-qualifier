# Issue 06 — Company + Qualification schema & migration

**Type**: HITL
**Blocked by**: none
**Parent**: `todo/prd-company-spine-and-enrichment-agents.md`
**User stories**: 1, 2, 3, 4, 5, 8

## What to build

Introduce **Company** as the spine and **Qualification** as append-only history, and migrate existing data into them.

- `companies` table: durable identity (company name, Owner contact/email/phone, website, industry, size) plus `state text not null default 'submitted'` and `is_client boolean not null default false`. Partial unique index on `(org_id, lower(email)) where email is not null`. Org-scoped RLS with select/insert/**update**/delete.
- `qualifications` table: `company_id` FK (cascade), the point-in-time ask (`use_case`, `budget_range`, `urgency`), `result jsonb`, `score`, `grade`, `created_at`. Org-scoped RLS.
- Migration: insert each Company with `id = leads.id` (reuse the key), create one Qualification per `leads` row preserving `created_at`, derive initial `state` (`mapped` if the Company has any Opportunity Map, else `qualified`).
- Repoint `opportunity_maps`: rename `lead_id` → `company_id`, retarget FK to `companies(id)` on delete cascade.
- Drop `leads` only after verification.

HITL because it is a destructive data migration; review row counts and spot checks before dropping `leads`.

## Acceptance criteria

- [ ] `companies` and `qualifications` tables exist with org-scoped RLS including an UPDATE policy
- [ ] Every former `leads` row has a matching Company (same id) and one Qualification
- [ ] All `opportunity_maps` resolve to a Company via `company_id`; none orphaned
- [ ] Partial unique index enforces one Company per `(org, lower(email))`
- [ ] `leads` dropped only after counts match and spot checks pass

## Blocked by

- None - can start immediately
