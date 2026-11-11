#!/bin/bash
service postgresql start
sleep 3

su postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
su postgres -c "psql -c \"CREATE DATABASE metro_router OWNER postgres;\""

export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/metro_router"

# Загружаем данные из файла, если он существует
if [ -f /app/init.sql ]; then
  echo "Загружаем данные из init.sql..."
  su postgres -c "psql -d metro_router -f /app/init.sql"
fi

uvicorn app.main:app --host 0.0.0.0 --port 3000