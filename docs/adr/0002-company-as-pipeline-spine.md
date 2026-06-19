# ADR 0002: Company as the pipeline spine

**Status:** Accepted
**Date:** 2026-06-19

The original `leads` table conflated two things: the durable identity of a prospect business (name, Owner email, website) and a single AI scoring. Email was the Lead's unique key, which forced re-qualification to overwrite in place — destroying scoring history — and gave Opportunity Maps no stable anchor to attach to as the pipeline grew.

We split the concept into two: **Company** (the durable business identity, keyed by normalized Owner email within an Org) and **Qualification** (one AI scoring of a Company, append-only). Opportunity Maps, Website Analyses, Research, and future artifacts all hang off the Company by `company_id`. Re-qualifying appends a new Qualification; the newest is current.

## Considered options

**Keep Lead as the spine, add child tables.** Simpler migration; `leads` row becomes the anchor. Rejected because "Lead" already meant both the business and its scoring — keeping the name would perpetuate the confusion, and the overwrite behavior would have to stay or require a messy retroactive split.

**Reuse the Lead id for the Company id.** Adopted in the migration: `companies.id = leads.id` so that existing `opportunity_maps.lead_id` values resolve without a mapping table. This is an implementation convenience, not an architectural commitment.

## Consequences

- All org-scoped artifacts reference `company_id`; `leads` is dropped after migration.
- Qualification history is preserved across re-runs; the overwrite-confirm modal is removed.
- "Lead" survives as informal shorthand but is not an entity in the model (see `CONTEXT.md`).
- State and `isClient` land on the Company, not on individual artifacts.
- All new tables include an RLS UPDATE policy from the start to avoid the bug found on `leads` (missing UPDATE policy silently denied overwrites).
