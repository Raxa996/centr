-- Настройка пользователя admin.raxa@test.com
-- Выполните этот скрипт в SQL редакторе Supabase

-- Создаем роли, если их нет
INSERT INTO roles(id, title) VALUES
('admin','Администратор'),
('owner','Владелец'),
('teacher','Преподаватель'),
('parent','Родитель')
ON CONFLICT (id) DO UPDATE SET title = excluded.title;

-- Добавляем admin.raxa@test.com в таблицу users с ролью admin
INSERT INTO users (id, full_name, role_id, phone)
SELECT 
    au.id,
    'Администратор Raxa',
    'admin',
    '+7 777 000 00 01'
FROM auth.users au 
WHERE au.email = 'admin.raxa@test.com'
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    phone = EXCLUDED.phone;

-- Проверяем результат
SELECT 'Setup complete for admin.raxa@test.com:' as info;
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
