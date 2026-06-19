# Lead Qualifier — Domain Glossary

## Agent

A named analysis configuration the app can run against an input. Each agent defines its own input, prompt, and output schema; a single generic task runs whichever agent is selected. The **Lead Qualifier**, **Website Analysis**, **Research**, **QA Prep**, and **Opportunity Map Generator** are agents.
_Avoid_: "app" or "model" when you mean a specific agent.

## Org

A workspace that groups users and their Companies. All Companies belong to an org, not directly to a user. One org maps to one paying customer (a business using the qualifier tool).

## Member

A user who belongs to an org. Members are invited by an admin; there is no public sign-up. A member's access is revoked by removing them from `org_members`.

## Admin

A member with elevated permissions within an org. Admins can invite new members and revoke access. The first member of an org is the admin.

## Company

The prospect business itself; the durable identity that qualifications, opportunity maps, and website analyses all attach to. Identified within an org by the Owner's **email** (normalized, lowercased). One Company has one Owner and may accumulate many artifacts over time.
Holds only durable identity: company name, Owner email/contact, website URL, industry, company size. The point-in-time ask (use case, budget, urgency) lives on the **Qualification**, never here.
_Avoid_: "client" for a generic prospect (a **Client** is specifically a won Company — see below), and "lead" when you mean the business rather than a single qualification of it.

## Lead

Retired as an entity. The prospect business is a **Company**; one AI scoring of it is a **Qualification**. "Lead" may survive informally for "a Company we're evaluating," but it is no longer a thing in the model.

## Owner

The decision-maker at a Company; the person the agency talks to on the discovery call and the recipient of the Opportunity Map. One Owner per Company.
_Avoid_: "customer".

## Company State

Where a Company sits in the agency's pipeline, advanced as each step finishes (submitted → qualified → analyzed → call-prepped → call-done → mapped). Each agent moves the Company forward. One current State per Company.

## Client

A Company that moved forward with the Org after receiving its Opportunity Map; the won outcome of the pipeline. Tracked by an `isClient` flag on the Company, set after the call and Opportunity Map. Separate from Company State: State is pipeline progress, Client is the deal outcome.

## QA Prep

A tailored set of discovery-call questions an agent generates for a Company from its latest Qualification and Website Analysis, so the call extracts the context the Opportunity Map needs. Produced before the call; belongs to a Company.

## Conversation

The Owner's answers from the discovery call: structured responses to the QA Prep questions plus free-text notes for whatever the call surfaces off-script. Feeds the Opportunity Map. Belongs to a Company (today stored as a `conversation` text blob inside the Opportunity Map).

## Opportunity Map

A ranked, ICE-scored set of service opportunities the agency produces for a qualified Company after a discovery call. Built from the call conversation plus a website analysis, and delivered to the Owner as a report. Produced by the **Opportunity Map Generator** agent and belongs to a Company (one Company can have many maps over time).

## Website Analysis

An AI evaluation of a Company's live website judged on design and conversion expertise: what works, what's underperforming, and what to improve. Produced by the Website Analysis agent from the scraped site plus Company context. Belongs to a Company (newest is current). Optional and non-blocking: Qualifications and Opportunity Maps consume the latest analysis when one exists, but run without it.
_Avoid_: conflating with **Opportunity Map** — a Website Analysis critiques the site itself and needs only a URL; an Opportunity Map proposes services and is grounded in a discovery call.

## Research

AI-gathered external signals about a Company from the open web: Google reviews, reputation, mentions, and other findings. Produced by the Research agent (enrichment) in the pre-call phase. Belongs to a Company (newest is current). Optional and non-blocking; feeds QA Prep and the Opportunity Map.
_Avoid_: conflating with **Website Analysis** — Research looks outward (the open web); Website Analysis critiques the Company's own site.

## ICE score

The priority score for one opportunity: the equal-weighted average of Impact, Confidence, and Ease, each 0-10. Banded into an A-D grade (A ≥ 8.0, B 6.5-7.9, C 4.5-6.4, D < 4.5) to match the Lead Qualifier's grading.

## Qualification

One AI scoring of a Company across fit, intent, budget, and urgency, producing a 0-100 score and an A-D grade. Captures the point-in-time ask it scored (use case, budget, urgency) alongside the result. A Company accumulates many Qualifications over time; the newest is the current one. Re-qualifying appends a new Qualification rather than overwriting the previous one.

## Session

An authenticated browser session managed by Supabase Auth via `@supabase/ssr`. Sessions are validated server-side on every request using a cookie. No client-side token handling.

## Relationships

- An **Org** has many **Companies**.
- A **Company** has many **Qualifications** (newest is current).
- A **Company** has many **Opportunity Maps**.
- A **Company** has many **Website Analyses** (newest is current).
- A **Website Analysis** informs **Qualifications** and **Opportunity Maps** (optional input); the Analysis runs first and the Map consumes it.
- Only the **Opportunity Map** computes **ICE scores**; a **Website Analysis** lists findings without scoring or ranking them.
- A **Company** has **Research** (newest is current); it looks outward at the open web, where **Website Analysis** looks at the Company's own site.
- A **Company** has a **QA Prep**, built from its latest **Qualification**, **Website Analysis**, and **Research**.
- **Research** and **Website Analysis** both feed the **QA Prep** and the **Opportunity Map** (optional inputs).
- A **Conversation** answers the **QA Prep** and feeds the **Opportunity Map**.
- A **Company** has one **Owner**.
- A **Company** has one current **Company State** (its position in the pipeline).
- A **Company** becomes a **Client** (`isClient`) when it moves forward after its **Opportunity Map**.

## Flagged ambiguities

- "Client" / "Company/Client Profile" was proposed for the prospect business. Resolved: a prospect is a **Company**; **Client** is reserved for a *won* Company (moved forward after the Opportunity Map). Don't use "client" for a generic prospect.
- "Lead" historically meant both the business identity and its qualification. Resolved: **Company** is the durable business identity; a **Qualification** is one scoring of it. "Lead" is retired as an entity.
