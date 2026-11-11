#!/bin/bash
# Запускаем PostgreSQL
service postgresql start
sleep 3

# Устанавливаем пароль для пользователя postgres и создаем базу
su postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
su postgres -c "psql -c \"CREATE DATABASE metro_router OWNER postgres;\""

# Запускаем наш FastAPI на порту 3000
uvicorn app.main:app --host 0.0.0.0 --port 3000