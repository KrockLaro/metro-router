@echo off
REM Обёртка для Task Scheduler'а. Запускает daily_refresh.
REM Логи — в backend\logs\daily_refresh.log

setlocal
cd /d "%~dp0.."
call .venv\Scripts\activate.bat
python -m scripts.daily_refresh
exit /b %ERRORLEVEL%