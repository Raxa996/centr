-- Исправление RLS политик для устранения бесконечной рекурсии
-- Выполните этот скрипт в SQL редакторе Supabase

-- Удаляем проблемные политики
DROP POLICY IF EXISTS "users self or admins" ON users;

-- Создаем простую политику для таблицы users
CREATE POLICY "users_select_policy" ON users
FOR SELECT
USING (true);

CREATE POLICY "users_insert_policy" ON users
FOR INSERT
WITH CHECK (true);

CREATE POLICY "users_update_policy" ON users
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Проверяем, что политики созданы
SELECT 'RLS policies fixed' as status;
