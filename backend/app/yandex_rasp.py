# backend/app/yandex_rasp.py

import os
from dotenv import load_dotenv
from yaschedule import YaSchedule

# Загружаем переменные из файла .env
load_dotenv()

# Читаем ключ из переменной окружения
YANDEX_RASP_API_KEY = os.getenv("YANDEX_RASP_API_KEY")

if not YANDEX_RASP_API_KEY:
    raise ValueError("Не найден YANDEX_RASP_API_KEY. Проверь файл .env")

# Создаём клиент для работы с API
yandex_client = YaSchedule(YANDEX_RASP_API_KEY)

# --- Пример функции для получения расписания между двумя станциями ---
def get_schedule(from_code: str, to_code: str, date: str):
    """
    Возвращает расписание между двумя станциями.
    from_code и to_code — это коды станций (например, 's2000001').
    date — дата в формате 'ГГГГ-ММ-ДД'.
    """
    try:
        # Запрашиваем расписание
        result = yandex_client.get_schedule(
            from_station=from_code,
            to_station=to_code,
            transport_types='suburban' # Ищем только электрички
        )
        return result
    except Exception as e:
        print(f"Ошибка при запросе к Яндекс.Расписаниям: {e}")
        return None