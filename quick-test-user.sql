-- Быстрое создание одного тестового пользователя
-- Выполните этот скрипт в SQL редакторе Supabase

-- Создаем тестового администратора
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
    'test@test.kz',
    crypt('test123', gen_salt('bf')),
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

-- Добавляем в таблицу users
INSERT INTO users (id, full_name, role_id, phone)
SELECT 
    au.id,
    'Тестовый пользователь',
    'admin',
    '+7 777 000 00 00'
FROM auth.users au 
WHERE au.email = 'test@test.kz'
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    phone = EXCLUDED.phone;

-- Проверяем созданного пользователя
SELECT 
    u.id,
    u.full_name,
    u.role_id,
    u.phone,
    au.email
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE au.email = 'test@test.kz';
