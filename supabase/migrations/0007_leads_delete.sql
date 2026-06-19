create policy "members can delete org leads"
  on leads for delete
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );
