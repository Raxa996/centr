# Инструкции по развертыванию

## 1. Настройка Supabase

### Создание проекта
1. Перейдите на https://supabase.com
2. Создайте новый проект (staging)
3. Дождитесь завершения инициализации (~2 минуты)

### Настройка базы данных
1. Откройте SQL Editor в панели Supabase
2. Скопируйте содержимое файла `schema.sql`
3. Вставьте и выполните (Run) - создастся вся структура БД

### Включение Realtime
1. Перейдите в Database → Replication
2. Включите Realtime для таблиц:
   - `bookings`
   - `lessons` 
   - `invoices`
   - `payments`

### Создание пользователей
1. Перейдите в Authentication → Users
2. Создайте пользователей для каждой роли:
   - **Owner**: email: `owner@example.com`, password: `password123`
   - **Admin**: email: `admin@example.com`, password: `password123`
   - **Teacher**: email: `teacher@example.com`, password: `password123`
   - **Parent**: email: `parent@example.com`, password: `password123`

### Заполнение таблицы users
Выполните в SQL Editor:
```sql
-- Получите user_id из Auth и заполните users таблицу
INSERT INTO users (id, role_id, full_name, phone) VALUES
('USER_ID_FROM_AUTH', 'owner', 'Владелец Центра', '+7 777 000 0001'),
('USER_ID_FROM_AUTH', 'admin', 'Администратор', '+7 777 000 0002'),
('USER_ID_FROM_AUTH', 'teacher', 'Преподаватель', '+7 777 000 0003'),
('USER_ID_FROM_AUTH', 'parent', 'Родитель', '+7 777 000 0004');
```

### Сид-данные (опционально)
Выполните в SQL Editor для тестовых данных:
```sql
-- Создание групп
INSERT INTO groups (title, teacher_id) VALUES
('Подготовка к школе', 'TEACHER_USER_ID'),
('Английский язык', 'TEACHER_USER_ID');

-- Создание детей
INSERT INTO children (parent_id, full_name, birthdate) VALUES
('PARENT_USER_ID', 'Тестовый Ребенок', '2018-01-01');

-- Создание уроков
INSERT INTO lessons (group_id, starts_at, ends_at, room) VALUES
('GROUP_ID', NOW() + interval '1 day', NOW() + interval '1 day 1 hour', 'Кабинет 1');
```

## 2. Настройка Vercel

### Подготовка репозитория
1. Загрузите проект в GitHub репозиторий
2. Убедитесь, что все файлы включены

### Импорт в Vercel
1. Перейдите на https://vercel.com
2. Войдите и нажмите "New Project"
3. Импортируйте ваш GitHub репозиторий
4. Framework Preset: "Other" или "Static Site"

### Настройка переменных окружения
В настройках проекта добавьте:
- `PUBLIC_SUPABASE_URL` = URL вашего Supabase проекта
- `PUBLIC_SUPABASE_ANON_KEY` = anon ключ из Settings → API

### Деплой
1. Нажмите "Deploy"
2. Дождитесь завершения сборки (~1-2 минуты)
3. Получите staging URL для тестирования

## 3. Проверка функциональности

### Тестирование входа
1. Откройте staging URL
2. Попробуйте войти под каждой ролью
3. Убедитесь в корректных редиректах:
   - Owner → owner-dashboard.html
   - Admin → admin-dashboard.html
   - Teacher → crm-dashboard.html
   - Parent → parent-dashboard.html

### Тестирование realtime
1. Откройте две вкладки с разными ролями
2. Создайте запись в одной вкладке
3. Убедитесь, что изменения видны во второй вкладке без перезагрузки

## 4. Переход в продакшн

После успешного тестирования:
1. Создайте новый Supabase проект для продакшна
2. Повторите настройку БД и пользователей
3. Создайте новый Vercel проект с production окружением
4. Обновите переменные окружения на production ключи

