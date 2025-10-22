-- Проверка существующих пользователей и их ролей
-- Выполните этот скрипт в SQL редакторе Supabase

-- Проверяем пользователей в auth.users
SELECT 'Users in auth.users:' as info;
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email IN ('admin@test.kz', 'teacher@test.kz', 'owner@test.kz', 'parent@test.kz')
ORDER BY email;

-- Проверяем пользователей в таблице users
SELECT 'Users in users table:' as info;
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
WHERE au.email IN ('admin@test.kz', 'teacher@test.kz', 'owner@test.kz', 'parent@test.kz')
ORDER BY au.email;

-- Проверяем роли
SELECT 'Available roles:' as info;
SELECT * FROM roles;
