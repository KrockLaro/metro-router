@echo off
setlocal
cd /d "%~dp0.."
call .venv\Scripts\activate.bat
python -m scripts.daily_refresh
exit /b %ERRORLEVEL%