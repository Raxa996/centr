-- Создание тестовых пользователей для существующего проекта Supabase
-- Выполните этот скрипт в SQL редакторе Supabase

-- Сначала проверим, какие пользователи уже есть
SELECT 'Existing users in auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

SELECT 'Existing users in users table:' as info;
SELECT u.id, u.full_name, u.role_id, u.phone FROM users u ORDER BY u.created_at;

-- Создаем тестовых пользователей, если их еще нет
-- Владелец
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner@test.kz',
    crypt('owner123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Администратор
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@test.kz',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Учитель
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'teacher@test.kz',
    crypt('teacher123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Родитель
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'parent@test.kz',
    crypt('parent123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Привязка ролей к пользователям
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
    'Тестовый родитель',
    'parent',
    '+7 777 123 45 67'
FROM auth.users au 
WHERE au.email = 'parent@test.kz'
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    phone = EXCLUDED.phone;

-- Показываем созданных пользователей
SELECT 'Created users:' as info;
SELECT 
    u.id,
    u.full_name,
    u.role_id,
    u.phone,
    au.email
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE au.email IN ('owner@test.kz', 'admin@test.kz', 'teacher@test.kz', 'parent@test.kz')
ORDER BY u.role_id;
