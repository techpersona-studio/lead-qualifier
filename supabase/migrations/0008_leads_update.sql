-- leads: members can update leads in their org.
-- RLS was enabled with select/insert/delete policies but no update policy, so the
-- dedup "rerun and overwrite" path (saveLead UPDATE branch) was denied and saved nothing.
create policy "members can update org leads"
  on leads for update
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  )
  with check (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );
