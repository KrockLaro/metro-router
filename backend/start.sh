#!/bin/bash
# Запускаем PostgreSQL
service postgresql start
sleep 3

# Устанавливаем пароль и создаем базу
su postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
su postgres -c "psql -c \"CREATE DATABASE metro_router OWNER postgres;\""

export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/metro_router"

# Загружаем данные из файла
if [ -f /app/init.sql ]; then
  echo "Загружаем данные из init.sql..."
  su postgres -c "psql -d metro_router -f /app/init.sql"
  
  # Создаем таблицу миграций и помечаем, что 001 уже применена
  echo "Фиксируем миграции..."
  su postgres -c "psql -d metro_router -c \"CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now());\""
  su postgres -c "psql -d metro_router -c \"INSERT INTO _migrations (name) VALUES ('001_schedules.sql') ON CONFLICT DO NOTHING;\""
fi

# Запускаем наш FastAPI на порту 3000
uvicorn app.main:app --host 0.0.0.0 --port 3000