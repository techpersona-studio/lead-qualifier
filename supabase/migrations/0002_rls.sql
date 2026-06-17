-- Enable RLS on all tables
alter table orgs        enable row level security;
alter table org_members enable row level security;
alter table leads       enable row level security;

-- org_members: users can read their own membership rows.
-- This is what the middleware queries to check org membership — without this
-- policy, the anon/publishable key can't see the row even after it's inserted,
-- causing the middleware to redirect every request to /onboarding.
create policy "members can read own rows"
  on org_members for select
  using (user_id = auth.uid());

-- org_members: only service role can insert/update/delete (handled via admin client)
-- No additional policies needed for mutations — admin client bypasses RLS.

-- orgs: members can read orgs they belong to
create policy "members can read own org"
  on orgs for select
  using (
    id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );

-- leads: members can read leads in their org
create policy "members can read org leads"
  on leads for select
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );

-- leads: members can insert leads into their org
create policy "members can insert org leads"
  on leads for insert
  with check (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );
