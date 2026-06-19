create table if not exists opportunity_maps (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references orgs(id) on delete cascade,
  user_id      uuid not null references auth.users(id),
  lead_id      uuid not null references leads(id) on delete cascade,
  conversation text not null,
  result       jsonb not null,
  top_ice      numeric,
  top_grade    text,
  created_at   timestamptz not null default now()
);

alter table opportunity_maps enable row level security;

create policy "members can read org opportunity maps"
  on opportunity_maps for select
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );

create policy "members can insert org opportunity maps"
  on opportunity_maps for insert
  with check (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );
