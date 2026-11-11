#!/bin/bash
# Запускаем PostgreSQL
service postgresql start
sleep 3

# Устанавливаем пароль и создаем базу
su postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
su postgres -c "psql -c \"CREATE DATABASE metro_router OWNER postgres;\""

# Жестко задаем URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/metro_router"

# Ждем пару секунд, чтобы БД точно поднялась
sleep 2

# СКАЧИВАЕМ РАСПИСАНИЕ (например, Киевское направление) при первом запуске
# (пока укажем одну линию, чтобы не ждать 20 минут)
python -m scripts.fetch_manual kievskoye

# Запускаем наш FastAPI на порту 3000
uvicorn app.main:app --host 0.0.0.0 --port 3000