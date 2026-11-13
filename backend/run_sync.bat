@echo off
chcp 65001 > nul
cd /d "%~dp0backend"

:: Если вы используете виртуальное окружение (venv), раскомментируйте строчку ниже:
:: call ..\venv\Scripts\activate.bat

:: Задаем переменные окружения (подставьте свой ключ Яндекса, если он не берется из .env)
set YANDEX_RASP_API_KEY=ваш_ключ_яндекса_если_нужен
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/metro_router

echo Запуск синхронизации расписания...
python -m scripts.auto_sync

:: Если скрипт создает/обновляет init.sql и вы хотите заливать его на GitHub, раскомментируйте блок ниже:
:: cd ..
:: git add backend/init.sql
:: git diff --quiet && git diff --staged --quiet || (git commit -m "Auto-update schedule [skip ci]" && git push)

echo Готово!