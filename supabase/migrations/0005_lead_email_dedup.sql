-- Owner email is the dedup key within an org (normalized lowercased in app code).
alter table leads
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists leads_org_email_unique
  on leads (org_id, lower(email))
  where email is not null;
