# Маршрутник ЦППК (Metro Router)

Кроссплатформенное приложение для построения маршрутов по электричкам ЦППК, МЦД и МЦК. Аналог Metroman с поддержкой расписаний, real-time задержек, доступности для маломобильных пассажиров и интерактивной схематичной карты.

## 🏗️ Архитектура

```
Mobile (React Native)  ──►  FastAPI  ──►  OpenTripPlanner  ──►  GTFS + OSM
                               │
                               ├──►  Redis (GTFS-RT кеш)
                               └──►  PostgreSQL (метаданные)
```

## 🚀 Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone https://github.com/your-username/metro-router.git
cd metro-router
```

### 2. Подготовить данные

Положите в `backend/data/otp/`:
- `tsppk_gtfs.zip` — расписание ЦППК (GTFS)
- `moscow.osm.pbf` — карта OSM ([скачать](https://download.geofabrik.de/russia/central-fed-district.html))

### 3. Запустить бэкенд

```bash
make up
```

API будет доступен на http://localhost:8000/docs

### 4. Запустить мобильное приложение

```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://<ваш-IP>:8000 npx expo start
```

## 📁 Структура

- `backend/` — FastAPI, OTP-клиент, GTFS-парсер, RAPTOR, GTFS-RT
- `mobile/` — React Native (Expo), SVG-карта, дизайн-система
- `infra/` — Docker Compose, Nginx
- `.github/` — CI/CD

## 🧪 Тесты

```bash
make test
```

E2E (Detox):
```bash
cd mobile
npm run build:e2e:ios
npm run test:e2e:ios
```

## 📜 Лицензия

MIT