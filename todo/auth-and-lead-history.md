# Auth + Lead History

**Status**: Open
**Priority**: High
**Effort**: L (2-5 days)
**Created**: 2026-06-17
**Owner**: AI + Thao
**Domain**: fullstack
**Links**: N/A
**Dependencies**: None
**Review mode**: end-only

---

## User Approval

**Approach Approved By**: _<pending>_
**Approval Date**: _<pending>_
**Approval Notes**: _To be filled when user approves the selected approach._

---

## Problem Statement

- **Symptom**: The app is fully public. Anyone with the URL can submit leads. Results are never saved — each qualification is fire-and-forget.
- **Root cause**: No auth, no database, no user concept. The app was built as a single-user stateless demo.
- **Impact**: Can't track history, can't share results with teammates, can't gate access to paying customers.
- **Evidence**: `web/app/page.tsx` — no session check. `web/app/api/qualify/route.ts` — result is returned to browser and discarded.

## Proposed Approaches

### Approach A — Supabase Auth + org-scoped Postgres

Add Supabase Auth (`@supabase/ssr`) for session management and use Supabase Postgres for the `orgs`, `org_members`, and `leads` tables. Route protection via Next.js middleware. Invite-only sign-up managed by the org admin inside the app.

- Pro: One provider handles auth and database. RLS policies enforce org scoping at the DB layer — no app-level filtering bugs.
- Con: Adds a Supabase project dependency; local dev needs either the Supabase CLI or a cloud dev project.

### Approach B — Next-Auth + external Postgres

Use NextAuth for session management and a separate Postgres (Railway, Neon) for data.

- Pro: More portable auth layer.
- Con: Two services to configure and keep in sync. More boilerplate. No built-in invite flow.

### Approach C — Manual JWT + Supabase Postgres

Roll JWT auth by hand, use Supabase only for data.

- Pro: Total control.
- Con: Significant security surface. No reason to avoid a proven library.

## Selected Approach

**Picked**: Approach A

Supabase handles both auth and data in one place, which cuts configuration surface in half. `@supabase/ssr` integrates cleanly with Next.js App Router middleware and server components. The invite flow (`auth.admin.inviteUserByEmail`) is built-in, and RLS makes org-scoped access control declarative rather than something we can accidentally forget in a new query.

Accepting: local dev requires either the Supabase CLI (free) or pointing at a cloud dev project. Worth it.

---

## Planned Approach

### Technical Strategy

Three new Supabase tables: `orgs`, `org_members`, and `leads`. RLS policies on all three — reads and writes are scoped to `org_id` via the `org_members` join. Supabase Auth manages sessions via cookies (`@supabase/ssr`). A Next.js middleware file gates every route except `/login` and `/auth/callback`. The existing `/api/qualify` route gets one addition: after polling the trigger.dev result, it inserts a row into `leads` before returning.

New pages: `/login` (email/password), `/leads` (org history list), `/leads/[id]` (full result detail reusing `QualificationResult`). An org management screen at `/settings/members` lets the admin invite and remove members.

### Implementation Steps

- [ ] **Step 1: Supabase project setup and database schema.** Create the Supabase project (or reuse an existing dev project), run migrations to create `orgs`, `org_members`, and `leads` tables, and configure RLS policies. This step produces no visible UI change — it's purely infrastructure.
  - New file: `supabase/migrations/0001_init.sql`
  - New file: `supabase/migrations/0002_rls.sql`

- [ ] **Step 2: Install Supabase packages and configure the client.** Install `@supabase/ssr` and `@supabase/supabase-js` into `web/`. Create server, browser, and middleware Supabase client utilities. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `web/.env.local`.
  - New file: `web/lib/supabase/server.ts` — server component client (uses `cookies()`)
  - New file: `web/lib/supabase/browser.ts` — browser client singleton
  - New file: `web/lib/supabase/middleware.ts` — session refresh helper

- [ ] **Step 3: Middleware route protection.** Add `web/middleware.ts` at the `web/` root. Any request to a non-auth route with no valid session redirects to `/login`. Auth callback route (`/auth/callback`) is always public.
  - New file: `web/middleware.ts`

- [ ] **Step 4: Login page.** Build `/login` — email + password form, error state, redirect to `/` on success. No sign-up link (invite-only). Matches existing app visual style (dark background, same font, same input aesthetic).
  - New file: `web/app/login/page.tsx`
  - New file: `web/components/LoginForm.tsx`

- [ ] **Step 5: Auth callback route.** Add the `/auth/callback` route handler that Supabase redirects to after invite link clicks and magic links. Exchanges the code for a session and redirects to `/`.
  - New file: `web/app/auth/callback/route.ts`

- [ ] **Step 6: Save lead result after qualification.** Update `/api/qualify/route.ts` to insert a `leads` row after `runs.poll()` returns successfully. Reads `org_id` from the user's session. Returns the saved lead `id` alongside the result so the browser can link to `/leads/[id]`.
  - Modified: `web/app/api/qualify/route.ts`
  - New file: `web/lib/leads.ts` — `saveLead(userId, orgId, formData, result)` helper

- [ ] **Step 7: Show result link after qualification.** Update `web/app/page.tsx` to use the `id` returned from the API and add a "View in history" link on the result screen pointing to `/leads/[id]`.
  - Modified: `web/app/page.tsx`

- [ ] **Step 8: Lead history list page.** Build `/leads` — a table of past leads for the org, ordered by `created_at` desc. Each row shows company name, grade pill, score, contact name, and date. Clicking a row navigates to `/leads/[id]`.
  - New file: `web/app/leads/page.tsx`
  - New file: `web/components/LeadRow.tsx`

- [ ] **Step 9: Lead detail page.** Build `/leads/[id]` — loads the lead row from Supabase, renders the existing `QualificationResult` component with the stored result. If the lead doesn't belong to the user's org, returns 404.
  - New file: `web/app/leads/[id]/page.tsx`

- [ ] **Step 10: Nav bar with history link and sign-out.** Add a minimal top nav to the app layout: "Leads" link to `/leads`, "New Lead" link to `/`, and a sign-out button. Only visible when authenticated (middleware guarantees this for all non-auth routes).
  - New file: `web/components/Nav.tsx`
  - Modified: `web/app/layout.tsx`

- [ ] **Step 11: Org member management page.** Build `/settings/members` — lists current org members (name, email, joined date) and provides an invite form (email input → calls `auth.admin.inviteUserByEmail`) and a remove button per member (deletes `org_members` row). Admin-only: non-admins see the list but not the invite/remove controls.
  - New file: `web/app/settings/members/page.tsx`
  - New file: `web/app/api/org/invite/route.ts`
  - New file: `web/app/api/org/members/[id]/route.ts`

- [ ] **Step 12: Update docs.** Update `CLAUDE.md` with new env vars, new routes, and the Supabase project reference. Update `CONTEXT.md` if any terms shifted during implementation.
  - Modified: `CLAUDE.md`
  - Modified: `CONTEXT.md` (if needed)

---

## Success Criteria

**Automated checks:**
- [ ] `cd web && npm run build` passes with no type errors
- [ ] `cd web && npm run lint` passes

**Behavior:**
- [ ] Unauthenticated request to `/` redirects to `/login`
- [ ] Unauthenticated request to `/leads` redirects to `/login`
- [ ] Valid login redirects to `/`
- [ ] After qualification, lead row exists in `leads` table with correct `org_id` and `user_id`
- [ ] `/leads` shows only leads belonging to the logged-in user's org
- [ ] `/leads/[id]` with an id from another org returns 404
- [ ] Invite email sent when admin submits invite form
- [ ] Removing a member from `org_members` immediately prevents their next request from returning data (RLS enforced)
- [ ] Sign-out clears session and redirects to `/login`

**Manual verification:**
- [ ] Log in with valid credentials → lands on form
- [ ] Submit a lead → result shown → "View in history" link appears
- [ ] Click history link → `/leads/[id]` shows same result
- [ ] Navigate to `/leads` → row appears in list
- [ ] Sign out → `/login`
- [ ] Try accessing `/leads` directly after sign-out → redirected to `/login`

---

## Visual Specification

- **Login page**: Centered card on the same dark background as the app. Email + password fields. "Sign in" button. No sign-up link. Error message inline below the form on bad credentials.
- **Nav bar**: Minimal top bar. Left: app name/logo. Right: "New Lead" | "Leads" links + "Sign out" button. Same dark aesthetic, no heavy borders.
- **History list (`/leads`)**: Full-width table. Columns: Company, Grade (colored pill), Score, Contact, Date. Rows are clickable. Empty state: "No leads yet. Submit your first lead."
- **Detail page (`/leads/[id]`)**: Reuses `QualificationResult` component as-is. No animations on load (data is already available — no need to fake the reveal timing). Back link to `/leads`.
- **Members page (`/settings/members`)**: Simple list. Email, name, joined date per row. "Remove" button (admin only). Invite form at the bottom: email input + "Send invite" button.

## Component Map

| Component | Path | Responsibility |
|-----------|------|----------------|
| `LoginForm` | `web/components/LoginForm.tsx` | Email/password sign-in form with error state |
| `Nav` | `web/components/Nav.tsx` | Top nav bar with links and sign-out |
| `LeadRow` | `web/components/LeadRow.tsx` | Single row in the history table |
| `QualificationResult` | `web/components/QualificationResult.tsx` | Reused as-is for detail page |

## Style & Theme Checklist

- [ ] Login and nav match existing dark background and font (no new design tokens introduced)
- [ ] Grade pill colors match existing `QualificationResult` grade colors
- [ ] No inline styles except dynamic values
- [ ] No hardcoded hex values — reuse existing CSS variables from `globals.css`

## Accessibility Checklist

- [ ] Login form: labels associated with inputs, error announced via `aria-live`
- [ ] Nav links keyboard navigable with visible focus ring
- [ ] History table: `<th>` headers, row click has keyboard equivalent
- [ ] Invite form: email input labeled, success/error announced

## Visual Verification Plan

1. `cd web && npm run dev`, open `http://localhost:3000`
2. Verify redirect to `/login` without a session
3. Sign in → verify redirect to `/` with nav bar visible
4. Submit a lead → verify "View in history" link appears on result
5. Click link → verify `/leads/[id]` renders the result correctly
6. Navigate to `/leads` → verify the lead appears in the list
7. Click the list row → verify it navigates to the detail page
8. Go to `/settings/members` → verify member list and invite form
9. Sign out → verify redirect to `/login`, back-button to `/` redirects back to `/login`
10. Resize to 375px mobile → verify nav and list don't overflow

## Test Selectors

| Element | Selector | Purpose |
|---------|----------|---------|
| Sign-in button | `[data-testid="signin-button"]` | Trigger login |
| Email input | `[data-testid="email-input"]` | Fill credentials |
| Password input | `[data-testid="password-input"]` | Fill credentials |
| Sign-out button | `[data-testid="signout-button"]` | Trigger sign-out |
| Lead row | `[data-testid="lead-row"]` | Click to navigate to detail |

---

## Wire Compatibility

**Endpoint affected**: `POST /api/qualify`

**Breaking changes**:
- [ ] Response schema changed — `id` field added to the response body alongside the existing `QualificationResult` fields

**Migration strategy**: Additive only. The `id` field is new. Existing consumers (the `page.tsx` state handler) need to be updated to read it, but no fields are removed or renamed.

**Frontend coordination**: Both sides live in this repo. Step 6 (API) and Step 7 (page) are done together.

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation | Reviewer / QA verification |
|------|--------|------------|------------|---------------------------|
| Vercel root directory still pointing to `frontend/` after rename | High | High | Update Vercel dashboard Project Settings → Root Directory to `web/` before first deploy | Trigger a deploy and verify it succeeds |
| RLS policy misconfigured — org members can read other orgs' leads | High | Med | Write RLS policies against `org_members` join, not just `org_id` match; test with two separate org accounts | Create two orgs, submit a lead in each, verify neither can read the other's leads |
| `auth.admin.inviteUserByEmail` requires service role key — must never be exposed client-side | High | Low | Call only from server-side API route (`/api/org/invite`), never from browser | Confirm the invite API route uses `SUPABASE_SERVICE_ROLE_KEY` not the anon key |
| Session not refreshed on long-lived tabs — user gets 401 on API calls | Med | Med | `@supabase/ssr` middleware refreshes session on every request automatically | Leave a tab open 1hr, submit a lead, verify it succeeds |
| `QualificationResult` reveal animations look wrong when loaded from DB (data already present) | Low | High | Disable or skip the stagger animations when rendering from history (pass a `static` prop) | View a lead detail page and confirm animations don't flicker or repeat oddly |

---

## Implementation Notes

### Progress Log

- 2026-06-17 — Plan drafted. Approach A selected. Waiting for user approval.

### Decisions Made

- Leads are org-scoped, not user-scoped. See `docs/adr/0001-org-scoped-leads.md`.
- Invite-only auth. No public sign-up.
- Result saved by the Next.js API route after polling, not by the trigger.dev task.
- Detail page at `/leads/[id]` reuses existing `QualificationResult` component.
- `@supabase/ssr` for session management (App Router compatible, cookie-based).

---

## Completion Summary

_(To be filled when implementation is complete.)_

### What Was Delivered
- _..._

### Lessons Learned
- _..._

### Future Considerations
- _..._

---

## Documentation Updated

_(To be filled when docs are synced.)_

- _..._
