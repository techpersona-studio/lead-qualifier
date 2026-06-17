# Lead Qualifier — Domain Glossary

## Org

A workspace that groups users and their leads. All leads belong to an org, not directly to a user. One org maps to one paying customer (a business using the qualifier tool).

## Member

A user who belongs to an org. Members are invited by an admin; there is no public sign-up. A member's access is revoked by removing them from `org_members`.

## Admin

A member with elevated permissions within an org. Admins can invite new members and revoke access. The first member of an org is the admin.

## Lead

A prospective customer that a member has submitted for AI qualification. A lead stores the original form input (`LeadFormData`) and the AI-generated result (`QualificationResult`). Leads belong to an org and are visible to all members of that org.

## Qualification

The AI scoring process that produces a `QualificationResult` from a `LeadFormData`. A qualification runs as a trigger.dev async task. The result is persisted to the `leads` table by the Next.js API route after polling completes.

## Session

An authenticated browser session managed by Supabase Auth via `@supabase/ssr`. Sessions are validated server-side on every request using a cookie. No client-side token handling.
