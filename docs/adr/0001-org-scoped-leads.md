# ADR 0001: Org-scoped lead ownership

**Status:** Accepted  
**Date:** 2026-06-17

## Context

The app started as a single-user, stateless tool — no accounts, no history. Adding auth raised the question of ownership: do leads belong to a user or to a team?

The intended direction is a B2B SaaS product where multiple users inside a company share a workspace and can all see the same lead history.

## Decision

Leads belong to an **org**, not a user. Every lead row stores both `org_id` (ownership) and `user_id` (who submitted it). History queries are scoped to `org_id`. All members of an org see all leads in that org.

## Alternatives considered

**User-scoped leads** — each user sees only their own submissions. Simpler to build, but wrong for a team context where a manager needs visibility across all reps. Hard to retrofit shared access later.

**User-scoped with sharing** — leads default to private but can be shared. Adds UI complexity and a permission layer before the product has validated demand for that granularity.

## Consequences

- Requires an `orgs` table and an `org_members` join table from day one.
- RLS policies use `org_id` as the primary access control key.
- Multi-org membership (one user in two orgs) is possible without schema changes — the `org_members` table already supports it.
- Role-based permissions within an org (e.g. manager vs rep) are not implemented yet but can be added as a column on `org_members`.
