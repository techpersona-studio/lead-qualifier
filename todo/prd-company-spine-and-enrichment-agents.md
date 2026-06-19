# PRD — Company spine + enrichment agents (Website Analysis, Research)

**Status**: Approved for implementation
**Created**: 2026-06-19
**Domain glossary**: `CONTEXT.md` · **Pipeline vision**: `docs/pipeline.md` · **Prior PRD**: `todo/prd-agency-agents-platform.md`

---

## Problem Statement

Today a **Lead** row conflates two things: the prospect business's durable identity (name, website, Owner email) and a single AI scoring. Email is the Lead's key, so re-qualifying the same Owner overwrites the previous scoring in place; there is no qualification history. There is no durable **Company** to hang artifacts off, no record of where a Company sits in the funnel (**State**), and no marker for whether a Company became a **Client**.

The funnel in `docs/pipeline.md` also has two missing enrichment steps before a discovery call: a critique of the Company's own website, and external research (Google reviews, reputation, web findings). Both exist only as throwaway inline scrapes today, not as artifacts.

## Solution

1. **Company as the spine.** A new `companies` table holds durable identity, keyed by normalized Owner email within an Org. Qualifications, Opportunity Maps, Website Analyses, and Research all attach to a Company. `state` and `is_client` columns ride on the Company.

2. **Qualification becomes append-only history.** A new `qualifications` table stores one scoring per row (`company_id` FK). Re-qualifying appends a new Qualification; the newest is current. The overwrite-confirm modal retires.

3. **Website Analysis agent.** An agent critiques the Company's own live website on design and conversion expertise (what works, what's weak, what to improve). Company-scoped, optional, newest-current.

4. **Research agent.** An agent gathers external signals about the Company from the open web (Google reviews, reputation, mentions). Company-scoped, optional, newest-current. The external source is chosen during slice 10.

All agents keep the established pattern: prompt + types + validator + agent-lib + trigger task on the task side; route + persistence + page on the web side.

## User Stories

### Company identity

1. As a **Member**, I want each prospect stored as a **Company** keyed by the Owner's email, so that one business is one record no matter how many times we touch it.
2. As a **Member**, I want a Company to hold only durable identity (name, Owner email/contact, website, industry, size), so that the point-in-time ask never pollutes the business record.
3. As an **Admin**, I want Companies scoped to my Org, so that the same email in another Org is a separate Company.
4. As a **Member**, I want email matched case- and whitespace-insensitively, so that `Joe@X.com` and `joe@x.com` are the same Company.
5. As a **Member**, I want existing leads migrated into Companies + Qualifications with their Opportunity Maps still attached, so that no history is lost.

### Qualification history

6. As a **Member**, I want re-qualifying a Company to append a new **Qualification** instead of overwriting, so that I can see how a Company's scoring changed over time.
7. As a **Member**, I want the newest Qualification treated as current, so that the Company's headline grade/score reflects the latest scoring.
8. As a **Member**, I want each Qualification to record the ask it scored (use case, budget, urgency), so that I know what the score was about.
9. As a **Member**, I want the overwrite-confirm modal gone, so that submitting the same email just records another Qualification.

### Website Analysis

10. As a **Member**, I want to run a **Website Analysis** on a Company's site, so that I get a design/conversion critique before the call.
11. As a **Member**, I want the analysis to list what works, what's underperforming, and what to improve, so that I can speak credibly about their site.
12. As a **Member**, I want Website Analyses kept as history on the Company (newest current), so that I can re-run after they change their site.
13. As a **Member**, I want analysis to be optional and non-blocking, so that a Company with no website still flows through the pipeline.

### Research

14. As a **Member**, I want to run **Research** on a Company, so that I see Google reviews and other open-web findings.
15. As a **Member**, I want Research kept separate from Website Analysis, so that "their reputation" and "their site quality" don't blur together.
16. As a **Member**, I want Research kept as history on the Company (newest current), so that I can refresh it later.
17. As a **Member**, I want Research optional and non-blocking, so that a Company with thin web presence still flows through.

### State and Client

18. As a **Member**, I want each Company to show a pipeline **State** (submitted → qualified → analyzed → call-prepped → call-done → mapped), so that I know where it sits.
19. As a **Member**, I want State to advance as each step finishes, so that the funnel reflects reality without manual bookkeeping.
20. As a **Member**, I want to mark a Company as a **Client** (`isClient`), so that I can see which Companies moved forward with us after the Opportunity Map.
21. As a **Member**, I want Client to be independent of State, so that a `mapped` Company can be a Client or not.

### Company detail

22. As a **Member**, I want one Company detail page showing identity, Qualification history, Website Analyses, Research, and Opportunity Maps, so that everything about a Company is in one place.
23. As a **Member**, I want the existing per-lead Opportunity Maps re-homed under the Company, so that nothing is orphaned by the rename.

### Out of scope here (future)

24. As a **Member**, I want **QA Prep** generated from Qualification + Website Analysis + Research (future PRD).
25. As a **Member**, I want the **Conversation** captured as structured answers to QA Prep + free text (future PRD).

## Implementation Decisions

### Modules

| Module | Responsibility | Test? |
|--------|----------------|-------|
| **Company persistence** | `companies` table; find/create by normalized email; `state`, `is_client` columns | Yes — behavior via mocked Supabase (prior art: `leads.test.ts`) |
| **Qualification persistence** | `qualifications` table; append per Company; latest-current query | Yes |
| **Leads → Company migration** | Split each `leads` row into a Company + a Qualification; repoint Opportunity Maps | Migration verification (row counts, spot checks) |
| **Qualify flow on Company** | Route upserts Company by email, appends a Qualification; no overwrite gate | Yes (prior art: `qualify-route.test.ts`) |
| **Website Analysis agent** | prompt + types + validator + agent-lib + `analyze-website` task | Validator unit test; prompt review |
| **Research agent** | prompt + types + validator + agent-lib + `research-company` task; external reviews/search tool | Validator unit test; prompt review |
| **Artifact persistence + APIs** | `website_analyses`, `research` tables (org+company RLS incl. UPDATE); `/api/website-analysis`, `/api/research` | Manual/browser (not in core test set) |
| **Company detail UI** | one page: identity, qualification history, analyses, research, maps | Browser verification |
| **State + Client** | `state`, `is_client` columns; advance State per step; UI badge/toggle | Manual/browser |

### Schema changes

**companies (new):** `id`, `org_id` (FK orgs, cascade), `created_by` (user), `company_name`, `contact_name`, `email`, `phone`, `industry`, `company_size`, `website_url`, `state text not null default 'submitted'`, `is_client boolean not null default false`, `created_at`, `updated_at`. Partial unique index on `(org_id, lower(email)) where email is not null`. Org-scoped RLS with select/insert/**update**/delete.

**qualifications (new):** `id`, `org_id`, `company_id` (FK companies, cascade), `user_id`, `use_case`, `budget_range`, `urgency`, `result jsonb`, `score int`, `grade text`, `created_at`. Org-scoped RLS.

**website_analyses (new):** `id`, `org_id`, `company_id` (FK companies, cascade), `user_id`, `result jsonb`, `scraped_text text`, `created_at`. Org-scoped RLS.

**research (new):** `id`, `org_id`, `company_id` (FK companies, cascade), `user_id`, `result jsonb`, `sources jsonb`, `created_at`. Org-scoped RLS.

**opportunity_maps (change):** rename `lead_id` → `company_id`, FK now references `companies(id)` on delete cascade.

### Migration approach

Insert each new Company with `id = leads.id` (reuse the old primary key). Opportunity Maps already store that id in `lead_id`, so repointing is a column rename + FK retarget with no mapping table. Each `leads` row also produces one `qualifications` row (use_case/budget/urgency/result/score/grade, `created_at` preserved). Derive initial `state` from whether a Company has any Opportunity Map (`mapped`) else `qualified`; `is_client` defaults false. The old `leads` table is dropped only after verification.

### API contracts

**POST /api/qualify** — upserts the Company by normalized email (refreshing identity incl. latest industry/size), appends a Qualification, returns `{ companyId, qualificationId, ...result }`. No `409`/overwrite path.

**POST /api/website-analysis** — `{ companyId }`; loads Company, scrapes site, runs `website-analysis` agent, saves, returns saved analysis. Flags when no website.

**POST /api/research** — `{ companyId }`; loads Company, runs `research-company` agent against the chosen external source, saves, returns saved research.

### Architectural decisions

- Company is the spine; email key moves from Lead to Company (extends ADR-0001 org-scoping; consider ADR-0002).
- Qualification is append-only history (kills overwrite); newest is current.
- Website Analysis (own site) and Research (open web) are distinct artifacts, each Company-scoped, optional, newest-current.
- New agents keep bespoke trigger tasks (`analyze-website`, `research-company`), mirroring `generate-opportunity-map`; a generic `run-agent` stays deferred.
- State and Client are columns on Company; State is pipeline progress, Client is the deal outcome — independent.
- All new tables get the UPDATE RLS policy from the start (lesson from the missing-policy bug on `leads`).

## Testing Decisions

**What makes a good test:** Exercise public interfaces (API routes, exported lib functions, validators) and assert observable behavior. Do not test implementation details or mock the module under test's internals.

**Core modules under test:**

| Module | Test file | Behaviors |
|--------|-----------|-----------|
| Company persistence | `web/__tests__/companies.test.ts` | find/create by email; normalization; org scoping |
| Qualification persistence | `web/__tests__/qualifications.test.ts` | append; latest-current ordering |
| Qualify route | `web/__tests__/qualify-route.test.ts` | upsert Company + append Qualification; no overwrite gate |
| Website Analysis validator | `trigger/__tests__/website-analysis.test.ts` | schema validation of model output |
| Research validator | `trigger/__tests__/research.test.ts` | schema validation of model output |

**Prior art:** `web/__tests__/qualify-route.test.ts`, `web/__tests__/leads.test.ts`, `trigger/__tests__/opportunity-scorer.test.ts` — mock Supabase and trigger.dev at the module boundary.

**Manual verification:** migration (row counts + spot checks), Company detail page, State/Client UI, both agent prompts (browser-verified through the company page).

## Out of Scope

- QA Prep agent and structured Conversation capture (next PRD).
- Choosing the Research external source vendor (decided in slice 10).
- Migrating the Lead Qualifier onto a generic `run-agent` task.
- Branded PDF, email delivery of the Map.
- Outreach agent and automated send (stays human-in-the-loop when built).

## Further Notes

- Full target model and relationships live in `CONTEXT.md`; funnel vision in `docs/pipeline.md`.
- "Lead" is retired as an entity; it survives only as informal shorthand.
- Company-spine refactor ships before the two agents so `company_id` is stable for their FKs.
