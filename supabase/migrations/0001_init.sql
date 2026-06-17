-- orgs: named workspaces
create table if not exists orgs (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- org_members: users belonging to an org with a role
create table if not exists org_members (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references orgs(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- leads: qualification results scoped to an org
create table if not exists leads (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references orgs(id) on delete cascade,
  user_id      uuid not null references auth.users(id),
  company_name text not null,
  contact_name text not null,
  industry     text,
  company_size text,
  budget_range text,
  urgency      text,
  use_case     text,
  website_url  text,
  result       jsonb not null,
  grade        text,
  score        integer,
  created_at   timestamptz not null default now()
);
