# Центр развития "Радуга" - CRM система

Статичный фронт переведен на Supabase (Postgres + Auth + Realtime) для работы онлайн.

## Структура проекта

- `index.html` - главная страница с формами входа
- `admin-dashboard.html` - кабинет администратора  
- `owner-dashboard.html` - кабинет владельца
- `parent-dashboard.html` - кабинет родителя
- `crm-dashboard.html` - CRM панель для персонала
- `location.html` - страница расположения
- `styles.css` - общие стили
- `script.js` - основная логика приложения
- `supabaseClient.js` - клиент Supabase
- `schema.sql` - схема базы данных

## Роли пользователей

- `owner` - Владелец (owner-dashboard.html)
- `admin` - Администратор (admin-dashboard.html) 
- `teacher` - Преподаватель (crm-dashboard.html)
- `parent` - Родитель (parent-dashboard.html)

## Локальная разработка

1. Создайте проект в Supabase
2. Скопируйте `env.example` в `.env` и заполните ваши ключи
3. Запустите локальный сервер (например, `python -m http.server`)

## Развертывание

1. Импортируйте репозиторий в Vercel
2. Добавьте переменные окружения:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
3. Задеплойте

## База данных

Выполните `schema.sql` в SQL Editor Supabase для создания таблиц и политик безопасности.
