-- Supabase schema for Rainbow Center CRM
create extension if not exists pgcrypto;

-- Roles table
create table if not exists roles (id text primary key, title text not null);
insert into roles(id,title) values
('owner','Владелец'),('admin','Администратор'),('teacher','Преподаватель'),('parent','Родитель')
on conflict do nothing;

-- Users table
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  full_name text,
  role_id text not null references roles(id),
  created_at timestamptz default now()
);

-- Children table
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete cascade,
  full_name text not null,
  birthdate date
);

-- Groups table
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  teacher_id uuid not null references users(id) on delete restrict,
  capacity int default 12
);

-- Lessons table
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at   timestamptz not null,
  room text,
  status text default 'planned'
);

-- Bookings table
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status text default 'pending',
  comment text,
  created_at timestamptz default now()
);

-- Attendances table
create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  child_id  uuid not null references children(id) on delete cascade,
  present boolean not null default false,
  note text,
  unique (lesson_id, child_id)
);

-- Invoices table
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete restrict,
  amount numeric(12,2) not null,
  due_date date,
  status text default 'issued'
);

-- Payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  paid_at timestamptz default now(),
  provider text,
  tx_id text
);

-- Audit logs table
create table if not exists audit_logs (
  id bigserial primary key,
  actor uuid references users(id) on delete set null,
  entity text not null,
  entity_id uuid,
  action text not null,
  at timestamptz default now(),
  meta jsonb
);

-- Indexes
create index if not exists lessons_starts_idx on lessons (starts_at);
create index if not exists bookings_created_idx on bookings (created_at);
create index if not exists invoices_status_due_idx on invoices (status, due_date);

-- Enable RLS
alter table users enable row level security;
alter table children enable row level security;
alter table groups enable row level security;
alter table lessons enable row level security;
alter table bookings enable row level security;
alter table attendances enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table audit_logs enable row level security;

-- RLS Policies

-- Users policies
create policy if not exists "users self or admins"
on users for select
using (
  id = auth.uid()
  or exists (select 1 from users u where u.id = auth.uid() and u.role_id in ('owner','admin'))
);

-- Children policies
create policy if not exists "children read"
on children for select
using (
  parent_id = auth.uid()
  or exists (
    select 1 from groups g
    where g.teacher_id = auth.uid()
      and exists (
        select 1 from bookings b join lessons l on l.id=b.lesson_id
        where b.child_id = children.id and l.group_id=g.id
      )
  )
  or exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin'))
);

-- Groups policies
create policy if not exists "groups read"
on groups for select
using (
  teacher_id = auth.uid()
  or exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin'))
);

-- Lessons policies
create policy if not exists "lessons read"
on lessons for select
using (
  exists (select 1 from groups g where g.id=lessons.group_id and g.teacher_id=auth.uid())
  or exists (select 1 from bookings b join children c on c.id=b.child_id
             where b.lesson_id=lessons.id and c.parent_id=auth.uid())
  or exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin'))
);

-- Bookings policies
create policy if not exists "bookings read"
on bookings for select
using (
  exists (select 1 from children c where c.id=bookings.child_id and c.parent_id=auth.uid())
  or exists (select 1 from lessons l join groups g on g.id=l.group_id
             where l.id=bookings.lesson_id and g.teacher_id=auth.uid())
  or exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin'))
);

create policy if not exists "bookings insert parent"
on bookings for insert
with check (
  exists (select 1 from children c where c.id=child_id and c.parent_id=auth.uid())
);

create policy if not exists "bookings update admins/teachers"
on bookings for update
using (
  exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin'))
  or exists (select 1 from lessons l join groups g on g.id=l.group_id
             where l.id=bookings.lesson_id and g.teacher_id=auth.uid())
);

-- Invoices policies
create policy if not exists "invoices read"
on invoices for select
using (
  parent_id = auth.uid()
  or exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin'))
);

create policy if not exists "invoices admin write"
on invoices for insert, update, delete
using (exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin')))
with check (exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin')));

-- Payments policies
create policy if not exists "payments read"
on payments for select
using (
  exists (select 1 from invoices i where i.id=payments.invoice_id and i.parent_id=auth.uid())
  or exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin'))
);

create policy if not exists "payments admin write"
on payments for insert
with check (exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin')));

-- Audit logs policies
create policy if not exists "audit read admins"
on audit_logs for select
using (exists (select 1 from users u where u.id=auth.uid() and u.role_id in ('owner','admin')));
