-- =========================================================
-- Rainbow Center CRM — FULL SCHEMA + RLS + REALTIME (safe)
-- =========================================================

-- 0) extensions
create extension if not exists pgcrypto;

-- 1) roles
create table if not exists roles (
  id text primary key,
  title text not null
);

insert into roles(id, title) values
('owner','Владелец'),
('admin','Администратор'),
('teacher','Преподаватель'),
('parent','Родитель')
on conflict (id) do update set title = excluded.title;

-- 2) users (links to auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  full_name text,
  role_id text not null references roles(id),
  created_at timestamptz default now()
);

-- 3) children
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete cascade,
  full_name text not null,
  birthdate date
);

-- 4) groups
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  teacher_id uuid not null references users(id) on delete restrict,
  capacity int default 12
);

-- 5) lessons
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at   timestamptz not null,
  room text,
  status text default 'planned'      -- planned|done|canceled
);

-- 6) bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status text default 'pending',     -- pending|confirmed|canceled|no_show
  comment text,
  created_at timestamptz default now()
);

-- 7) attendances
create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  child_id  uuid not null references children(id) on delete cascade,
  present boolean not null default false,
  note text,
  unique (lesson_id, child_id)
);

-- 8) invoices / payments
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete restrict,
  amount numeric(12,2) not null,
  due_date date,
  status text default 'issued'       -- issued|paid|overdue|partial
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  paid_at timestamptz default now(),
  provider text,
  tx_id text
);

-- 9) audit logs
create table if not exists audit_logs (
  id bigserial primary key,
  actor uuid references users(id) on delete set null,
  entity text not null,
  entity_id uuid,
  action text not null,
  at timestamptz default now(),
  meta jsonb
);

-- 10) indexes
create index if not exists lessons_starts_idx      on lessons (starts_at);
create index if not exists bookings_created_idx    on bookings (created_at);
create index if not exists invoices_status_due_idx on invoices (status, due_date);

-- 11) enable RLS
alter table users       enable row level security;
alter table children    enable row level security;
alter table groups      enable row level security;
alter table lessons     enable row level security;
alter table bookings    enable row level security;
alter table attendances enable row level security;
alter table invoices    enable row level security;
alter table payments    enable row level security;
alter table audit_logs  enable row level security;

-- 12) RLS policies (drop + create) ------------------------

-- USERS (self or admins)
drop policy if exists "users self or admins" on users;
create policy "users self or admins"
on users for select
using (
  id = auth.uid()
  or exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- CHILDREN (parent, teacher of group, admins)
drop policy if exists "children read" on children;
create policy "children read"
on children for select
using (
  parent_id = auth.uid()
  or exists (
    select 1 from groups g
    where g.teacher_id = auth.uid()
      and exists (
        select 1 from bookings b
        join lessons l on l.id = b.lesson_id
        where b.child_id = children.id and l.group_id = g.id
      )
  )
  or exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- GROUPS (own groups or admins)
drop policy if exists "groups read" on groups;
create policy "groups read"
on groups for select
using (
  teacher_id = auth.uid()
  or exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- LESSONS (teacher's groups, parent of booked child, admins)
drop policy if exists "lessons read" on lessons;
create policy "lessons read"
on lessons for select
using (
  exists (select 1 from groups g where g.id = lessons.group_id and g.teacher_id = auth.uid())
  or exists (
    select 1 from bookings b
    join children c on c.id = b.child_id
    where b.lesson_id = lessons.id and c.parent_id = auth.uid()
  )
  or exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- BOOKINGS read
drop policy if exists "bookings read" on bookings;
create policy "bookings read"
on bookings for select
using (
  exists (select 1 from children c where c.id = bookings.child_id and c.parent_id = auth.uid())
  or exists (
    select 1 from lessons l
    join groups g on g.id = l.group_id
    where l.id = bookings.lesson_id and g.teacher_id = auth.uid()
  )
  or exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- BOOKINGS insert (parent)
drop policy if exists "bookings insert parent" on bookings;
create policy "bookings insert parent"
on bookings for insert
with check (
  exists (select 1 from children c where c.id = child_id and c.parent_id = auth.uid())
);

-- BOOKINGS update (admins/teachers)
drop policy if exists "bookings update admins/teachers" on bookings;
create policy "bookings update admins/teachers"
on bookings for update
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
  or exists (
    select 1 from lessons l
    join groups g on g.id = l.group_id
    where l.id = bookings.lesson_id and g.teacher_id = auth.uid()
  )
);

-- INVOICES read
drop policy if exists "invoices read" on invoices;
create policy "invoices read"
on invoices for select
using (
  parent_id = auth.uid()
  or exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- INVOICES write (split per command)
drop policy if exists "invoices admin insert" on invoices;
create policy "invoices admin insert"
on invoices for insert
with check (
  exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

drop policy if exists "invoices admin update" on invoices;
create policy "invoices admin update"
on invoices for update
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
)
with check (
  exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

drop policy if exists "invoices admin delete" on invoices;
create policy "invoices admin delete"
on invoices for delete
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- PAYMENTS read
drop policy if exists "payments read" on payments;
create policy "payments read"
on payments for select
using (
  exists (select 1 from invoices i where i.id = payments.invoice_id and i.parent_id = auth.uid())
  or exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- PAYMENTS insert (admins)
drop policy if exists "payments admin insert" on payments;
create policy "payments admin insert"
on payments for insert
with check (
  exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- AUDIT read (admins only)
drop policy if exists "audit read admins" on audit_logs;
create policy "audit read admins"
on audit_logs for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin')));

-- 13) Add tables to supabase_realtime safely
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'lessons'
  ) then
    execute 'alter publication supabase_realtime add table public.lessons';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookings'
  ) then
    execute 'alter publication supabase_realtime add table public.bookings';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'invoices'
  ) then
    execute 'alter publication supabase_realtime add table public.invoices';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'payments'
  ) then
    execute 'alter publication supabase_realtime add table public.payments';
  end if;
end
$$ language plpgsql;

-- ===================== END (one-shot) =====================