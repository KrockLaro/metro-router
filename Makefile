.PHONY: help backend mobile up down test lint clean

help:
	@echo "MetroRouter — доступные команды:"
	@echo "  make up        — поднять все сервисы через Docker Compose"
	@echo "  make down      — остановить все сервисы"
	@echo "  make backend   — запустить backend локально (uvicorn)"
	@echo "  make mobile    — запустить мобильное приложение (Expo)"
	@echo "  make test      — прогнать все тесты"
	@echo "  make lint      — проверить код линтерами"
	@echo "  make clean     — очистить кеши"

up:
	cd infra && docker compose up -d

down:
	cd infra && docker compose down

backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

mobile:
	cd mobile && npx expo start

test:
	cd backend && pytest -v
	cd mobile && npm test

lint:
	cd backend && ruff check app
	cd mobile && npx tsc --noEmit

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/.ruff_cache backend/.mypy_cache