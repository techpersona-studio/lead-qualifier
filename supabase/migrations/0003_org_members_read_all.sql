-- Members can read all rows in orgs they belong to (needed for the team members page).
-- The existing "members can read own rows" policy only returns the caller's own row,
-- which silently empties the members list for everyone except the first result.
create policy "members can read org rows"
  on org_members for select
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );
