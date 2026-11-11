FROM python:3.11-slim

WORKDIR /app

# Устанавливаем PostgreSQL и зависимости для Python
RUN apt-get update && apt-get install -y postgresql postgresql-contrib gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Устанавливаем Python-библиотеки
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt asyncpg

# Копируем код и скрипт запуска
COPY . .
RUN chmod +x start.sh

# Открываем порт, который просит Cloady
EXPOSE 3000

# Запускаем наш скрипт (он поднимет БД и сервер)
CMD ["./start.sh"]