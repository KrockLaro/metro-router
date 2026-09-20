# backend/test_yandex.py
from app.yandex_rasp import yandex_client

# Получаем список всех станций (это большой запрос, но он покажет, что ключ работает)
try:
    stations = yandex_client.get_all_stations()
    print(f"✅ Успешно! Получено {len(stations)} станций.")
    # Выведем первые 5 станций для примера
    for station in stations[:5]:
        print(f"  - {station['title']} (код: {station['codes']['yandex_code']})")
except Exception as e:
    print(f"❌ Ошибка: {e}")
