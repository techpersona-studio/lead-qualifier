# Lead Qualifier — Domain Glossary

## Agent

A named analysis configuration the app can run against an input. Each agent defines its own input, prompt, and output schema; a single generic task runs whichever agent is selected. The **Lead Qualifier** and the **Opportunity Map Generator** are agents.
_Avoid_: "app" or "model" when you mean a specific agent.

## Org

A workspace that groups users and their leads. All leads belong to an org, not directly to a user. One org maps to one paying customer (a business using the qualifier tool).

## Member

A user who belongs to an org. Members are invited by an admin; there is no public sign-up. A member's access is revoked by removing them from `org_members`.

## Admin

A member with elevated permissions within an org. Admins can invite new members and revoke access. The first member of an org is the admin.

## Lead

A prospective customer that a member has submitted for AI qualification. A lead stores the original form input (`LeadFormData`) and the AI-generated result (`QualificationResult`). Leads belong to an org and are visible to all members of that org. A lead is identified within its org by the Owner's **email** (normalized, lowercased); re-qualifying the same email overwrites the lead in place rather than creating a duplicate.

## Owner

The decision-maker at a Lead's business; the person the agency talks to on the discovery call and the recipient of the Opportunity Map. One Owner per Lead.
_Avoid_: "client" (collides with Org, the agency that pays for this tool) and "customer".

## Opportunity Map

A ranked, ICE-scored set of service opportunities the agency produces for a qualified Lead after a discovery call. Built from the call conversation plus a website analysis, and delivered to the Owner as a report. Produced by the **Opportunity Map Generator** agent and belongs to a Lead (one Lead can have many maps over time).

## ICE score

The priority score for one opportunity: the equal-weighted average of Impact, Confidence, and Ease, each 0-10. Banded into an A-D grade (A ≥ 8.0, B 6.5-7.9, C 4.5-6.4, D < 4.5) to match the Lead Qualifier's grading.

## Qualification

The AI scoring process that produces a `QualificationResult` from a `LeadFormData`. A qualification runs as a trigger.dev async task. The result is persisted to the `leads` table by the Next.js API route after polling completes.

## Session

An authenticated browser session managed by Supabase Auth via `@supabase/ssr`. Sessions are validated server-side on every request using a cookie. No client-side token handling.
