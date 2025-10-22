-- Привязка ролей без ручного ввода UUID
insert into users (id, full_name, role_id)
select id, 'Owner Test', 'owner'   from auth.users where email = 'owner@test.kz'
on conflict (id) do nothing;

insert into users (id, full_name, role_id)
select id, 'Admin Test', 'admin'   from auth.users where email = 'admin@test.kz'
on conflict (id) do nothing;

insert into users (id, full_name, role_id)
select id, 'Teacher Test', 'teacher' from auth.users where email = 'teacher@test.kz'
on conflict (id) do nothing;

insert into users (id, full_name, role_id)
select id, 'Parent Test', 'parent' from auth.users where email = 'parent@test.kz'
on conflict (id) do nothing;

