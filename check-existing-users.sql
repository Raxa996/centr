-- Проверка существующих пользователей в Supabase
-- Выполните этот скрипт в SQL редакторе Supabase

-- Проверяем пользователей в auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at;

-- Проверяем пользователей в таблице users
SELECT 
    u.id,
    u.full_name,
    u.role_id,
    u.phone,
    r.title as role_title
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
ORDER BY u.created_at;

-- Проверяем роли
SELECT * FROM roles;
