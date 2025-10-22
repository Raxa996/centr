-- Проверка текущего пользователя и его роли
-- Выполните этот скрипт в SQL редакторе Supabase

-- Проверяем пользователя admin.raxa@test.com
SELECT 'Checking admin.raxa@test.com:' as info;
SELECT 
    u.id,
    u.full_name,
    u.role_id,
    u.phone,
    au.email,
    r.title as role_title
FROM users u
JOIN auth.users au ON au.id = u.id
LEFT JOIN roles r ON r.id = u.role_id
WHERE au.email = 'admin.raxa@test.com';

-- Проверяем пользователя admin@test.kz
SELECT 'Checking admin@test.kz:' as info;
SELECT 
    u.id,
    u.full_name,
    u.role_id,
    u.phone,
    au.email,
    r.title as role_title
FROM users u
JOIN auth.users au ON au.id = u.id
LEFT JOIN roles r ON r.id = u.role_id
WHERE au.email = 'admin@test.kz';
