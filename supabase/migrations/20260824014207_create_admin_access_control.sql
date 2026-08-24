begin;

create table public.admin_users (
  user_id uuid primary key,
  created_at timestamptz not null default now(),
  role text not null default 'admin',
  status text not null default 'active',
  display_name text,
  constraint admin_users_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete cascade,
  constraint admin_users_role_check
    check (role in ('owner', 'admin')),
  constraint admin_users_status_check
    check (status in ('active', 'disabled')),
  constraint admin_users_display_name_check
    check (
      display_name is null
      or (
        char_length(display_name) <= 100
        and char_length(btrim(display_name)) > 0
      )
    )
);

comment on table public.admin_users is
  'Server-controlled allowlist for internal administrator access. Authentication credentials and session data remain in Supabase Auth and are not stored here.';

comment on column public.admin_users.role is
  'owner is the reserved highest-trust role; admin is a standard internal administrator. Both active roles may access the Point 5 admin area.';

comment on column public.admin_users.status is
  'active permits admin access; disabled revokes platform admin access without deleting the Supabase Auth identity.';

alter table public.admin_users enable row level security;

-- No anon or authenticated policy is created. Browser clients cannot inspect or
-- mutate the administrator allowlist, including their own potential row.
revoke all privileges on table public.admin_users
  from PUBLIC, anon, authenticated;

-- The Point 5 server authorization flow only needs allowlist reads. Initial
-- bootstrap and future membership changes remain trusted administrative work.
grant select on table public.admin_users to service_role;

commit;
