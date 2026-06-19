# PRD — Agency agents platform (Lead dedup + Opportunity Map)

**Status**: Approved for implementation · **Dedup + Opportunity Map**: implemented 2026-06-19
**Created**: 2026-06-19
**Domain glossary**: `CONTEXT.md` · **Pipeline vision**: `docs/pipeline.md`

---

## Problem Statement

The product today has one agent (Lead Qualifier) and no stable identity for a Lead. The same Owner can be qualified multiple times, producing duplicate rows and conflicting scores. After a discovery call, the agency has no structured way to turn the conversation into a client-ready, ICE-prioritized Opportunity Map. Both gaps block the funnel in `docs/pipeline.md`: qualify → call → map → deliver.

## Solution

1. **Lead dedup by Owner email** — Each Lead is uniquely identified within an Org by normalized email. Re-qualifying the same email overwrites the existing row in place (same `lead_id`). Before running the agent, the app checks for an existing Lead and asks the Member to confirm overwrite; no Claude call until confirmed.

2. **Opportunity Map Generator agent** — A second agent in the same codebase, selected as its own app in the nav. A Member selects an existing Lead, provides the call conversation (paste or `.txt`/`.md` drop), and the agent produces a ranked ICE report with expected business impact per opportunity. The report is saved, viewable in-app, and downloadable via print-to-PDF.

Both agents share the agent-registry pattern: `{ id, input schema, prompt, output schema }` behind a generic task (Opportunity Map uses this; Lead Qualifier migrates later).

## User Stories

### Lead dedup

1. As a **Member**, I want to enter the Owner's email when qualifying a Lead, so that the same prospect is not stored twice under different rows.
2. As a **Member**, I want to optionally enter the Owner's phone number, so that contact info is captured without being required for dedup.
3. As a **Member**, when I submit a Lead whose email already exists in my Org, I want a prompt asking whether to rerun and overwrite, so that I do not accidentally duplicate or waste an AI run.
4. As a **Member**, when I confirm overwrite, I want the existing Lead row updated (same id) with new form data and a new Qualification result, so that attached Opportunity Maps stay linked.
5. As a **Member**, when I cancel the overwrite prompt, I want no agent run and no database change, so that the existing Lead is preserved.
6. As an **Admin**, I want dedup scoped to my Org only, so that the same email in another Org's workspace is a separate Lead.
7. As a **Member**, I want email matching to ignore case and surrounding whitespace, so that `Joe@X.com` and `joe@x.com` are treated as the same Lead.

### Opportunity Map

8. As a **Member**, I want a separate Opportunity Map app in the nav, so that I can switch between qualifying leads and generating maps without confusion.
9. As a **Member**, I want to select an existing Lead from a dropdown when generating a map, so that I do not re-enter business context the system already has.
10. As a **Member**, I want to paste or drop a call transcript (`.txt`/`.md`), so that the agent can extract opportunities from what the Owner actually said.
11. As a **Member**, I want the map to use the Lead's prior Qualification, form data, and a fresh website scrape, so that recommendations are grounded in the full picture.
12. As a **Member**, I want each opportunity to show expected business impact in the Owner's metrics, so that the report is credible when forwarded to them.
13. As a **Member**, I want opportunities ranked by ICE score with A-D priority grades, so that I know where to start the conversation.
14. As a **Member**, I want a clear recommended first move at the top of the report, so that the Owner knows the suggested next step.
15. As a **Member**, I want the generated map saved to history, so that my Org can revisit past reports.
16. As a **Member**, I want to view the saved report on a dedicated page, so that I can review it before sharing.
17. As a **Member**, I want to download the report as PDF (print-styled for v1), so that I can send it to the Owner.
18. As an **Owner** (report recipient), I want the report to read respectfully and concretely, so that I can decide whether to move forward with the agency.
19. As a **Member**, I want prompt-injection text in a transcript treated as data only, so that malicious content cannot inflate scores.
20. As a **Member**, I want ICE math computed server-side from Impact/Confidence/Ease sub-scores, so that rankings are deterministic.

### Platform (future, out of scope here)

21. As a **Member**, I want outreach drafts human-reviewed before send (pipeline stage 4).
22. As a **Member**, I want branded PDF export (follow-up after print-to-PDF v1).
23. As a **Member**, I want to email the map directly to the Owner (pipeline stage 7).

## Implementation Decisions

### Modules

| Module | Responsibility | Test? |
|--------|----------------|-------|
| **Email normalization** | `trim().toLowerCase()` on Owner email; single function used by lookup and save | Yes — pure, deep module |
| **Lead persistence** | `findLeadByEmail`, `saveLead` upsert keyed on `(org_id, normalized email)` | Yes — behavior via mocked Supabase (prior art: `leads.test.ts`) |
| **Qualify API gate** | Before `tasks.trigger`, return 409 if Lead exists and `overwrite !== true` | Yes — prior art: `qualify-route.test.ts` |
| **Lead form + confirm UX** | Email/phone fields; on 409 show overwrite confirm; resubmit with `overwrite: true` | Manual verification primary |
| **ICE scoring** | Zod validate model output; server computes `iceScore`, `grade`, `rank` | Yes — pure scorer module |
| **Agent registry + run-agent task** | Lookup agent by id; run prompt; validate output | Integration via route tests |
| **Opportunity map persistence** | `opportunity_maps` table, org-scoped RLS, FK to `leads` | Migration + route tests |
| **Opportunity map prompt + input builder** | Rich context: lead form, qualification, scrape, conversation | Prompt review manual |
| **Opportunity map UI** | Generator page, report page, nav entry, print CSS | Browser verification |

### Schema changes

**Leads (dedup):** add `email text`, `phone text`, `updated_at timestamptz`; partial unique index on `(org_id, lower(email)) where email is not null`.

**Opportunity maps:** new table `opportunity_maps` with `org_id`, `user_id`, `lead_id`, `conversation`, `result jsonb`, extracted `top_ice`, `top_grade`, `created_at`; org-scoped RLS mirroring `leads`.

### API contracts

**POST /api/qualify** — request adds required `email`, optional `phone`, optional `overwrite: boolean`. Response adds `409 { exists: true, companyName, email, leadId }` when duplicate and not overwriting. Success unchanged except same `id` on overwrite.

**POST /api/opportunity-map** — request `{ leadId, conversation }`; loads Lead + qualification, scrapes website, runs `opportunity-map` agent, saves row, returns saved map.

### ICE output shape (from prototype)

```jsonc
{
  "summary": "string",
  "client": { "businessName": "string", "websiteUrl": "string|null", "statedGoals": ["string"] },
  "recommendedFirstMove": "string",
  "opportunities": [{
    "title": "string", "problem": "string", "proposedService": "string",
    "expectedOutcome": "string",
    "impact": 0, "confidence": 0, "ease": 0,
    "effort": "string", "risks": "string", "nextAction": "string",
    "iceScore": 0, "grade": "A|B|C|D", "rank": 1
  }],
  "flags": ["string"]
}
```

Server adds `iceScore`, `grade`, `rank`; model supplies sub-scores and prose only.

### Architectural decisions

- Agent registry in one codebase; two nav "apps" (Lead Qualifier, Opportunity Map).
- Dedicated `opportunity_maps` table (mirrors `leads` convention); generic `agent_runs` deferred until a third agent exists.
- Dedup ships before Opportunity Map so Lead identity is stable for `lead_id` FK.
- Qualify task stays as `qualify-lead` for now; Opportunity Map uses new `run-agent` task.

## Testing Decisions

**What makes a good test:** Exercise public interfaces (API routes, exported lib functions) and assert observable behavior. Do not test implementation details or mock internals of the module under test.

**Modules under test:**

| Module | Test file | Behaviors |
|--------|-----------|-----------|
| Email normalization | `web/__tests__/lead-email.test.ts` | trim, lowercase, empty edge |
| Lead persistence | `web/__tests__/leads.test.ts` | insert with email; upsert overwrite; find by email |
| Qualify route | `web/__tests__/qualify-route.test.ts` | 409 without overwrite; 200 with overwrite; agent not triggered on 409 |
| ICE scorer | `trigger/__tests__/opportunity-scorer.test.ts` (or web mirror) | score/grade/rank from sub-scores; sort order |

**Prior art:** `web/__tests__/qualify-route.test.ts`, `web/__tests__/leads.test.ts` — mock Supabase and trigger.dev at module boundary.

**Manual verification:** User will manually check dedup UX; browser check for Opportunity Map report + PDF after UI slice.

## Out of Scope

- Lead qualification history / versioning
- Branded `@react-pdf/renderer` PDF (queued follow-up)
- Email delivery of map to Owner
- Deep research agent, outreach agent, lead state machine
- Migrating Lead Qualifier onto `run-agent`
- Live email blur-check before submit

## Further Notes

- Full funnel documented in `docs/pipeline.md`.
- Outreach (stage 4) must remain human-in-the-loop when built.
- Legacy leads without email remain valid; partial unique index avoids blocking migration.
