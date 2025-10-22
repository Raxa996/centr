-- Обновление пароля для admin@test.kz
-- Выполните этот скрипт в SQL редакторе Supabase

-- Обновляем пароль для admin@test.kz
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'admin@test.kz';

-- Проверяем обновление
SELECT 'Password updated for admin@test.kz' as status;
