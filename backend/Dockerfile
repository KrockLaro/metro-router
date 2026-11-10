FROM python:3.12-slim

WORKDIR /app

# Устанавливаем системные зависимости (нужны для сборки некоторых Python-пакетов)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Копируем и устанавливаем Python-зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь остальной код бэкенда
COPY . .

# Cloady ожидает порт 3000, поэтому запускаем Uvicorn именно на нем
EXPOSE 3000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]