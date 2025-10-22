-- Добавление ролей к существующим пользователям
-- Выполните этот скрипт в SQL редакторе Supabase

-- Сначала создаем роли, если их нет
INSERT INTO roles(id, title) VALUES
('owner','Владелец'),
('admin','Администратор'),
('teacher','Преподаватель'),
('parent','Родитель')
ON CONFLICT (id) DO UPDATE SET title = excluded.title;

-- Добавляем пользователей в таблицу users с правильными ролями
INSERT INTO users (id, full_name, role_id, phone)
SELECT 
    au.id,
    'Владелец центра',
    'owner',
    '+7 777 000 00 01'
FROM auth.users au 
WHERE au.email = 'owner@test.kz'
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    phone = EXCLUDED.phone;

INSERT INTO users (id, full_name, role_id, phone)
SELECT 
    au.id,
    'Администратор',
    'admin',
    '+7 777 000 00 02'
FROM auth.users au 
WHERE au.email = 'admin@test.kz'
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    phone = EXCLUDED.phone;

INSERT INTO users (id, full_name, role_id, phone)
SELECT 
    au.id,
    'Преподаватель',
    'teacher',
    '+7 777 000 00 03'
FROM auth.users au 
WHERE au.email = 'teacher@test.kz'
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    phone = EXCLUDED.phone;

INSERT INTO users (id, full_name, role_id, phone)
SELECT 
    au.id,
    'Родитель',
    'parent',
    '+7 777 123 45 67'
FROM auth.users au 
WHERE au.email = 'parent@test.kz'
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    phone = EXCLUDED.phone;

-- Проверяем результат
SELECT 'Final result:' as info;
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
