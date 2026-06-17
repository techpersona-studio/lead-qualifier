-- Fix infinite recursion in "members can read org rows" policy.
--
-- The previous policy queried org_members from within an org_members policy,
-- which Postgres detects as infinite recursion. The fix: a SECURITY DEFINER
-- function that runs as the table owner and bypasses RLS for the inner lookup.

create or replace function get_my_org_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select org_id from org_members where user_id = auth.uid();
$$;

-- Drop the recursive policy and replace it with one that calls the helper.
drop policy if exists "members can read org rows" on org_members;

create policy "members can read org rows"
  on org_members for select
  using (
    org_id in (select get_my_org_ids())
  );
