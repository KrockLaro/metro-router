"""
Автоматизация: скачивает расписание -> делает SQL-дамп -> пушит в Git.
Запуск: python -m scripts.auto_sync gorkovskoye
"""
import asyncio
import os
import subprocess
import sys
import datetime
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool, get_pool
from app.schedule.worker import fetch_direction
from app.schedule.yandex_client import QuotaExceeded


async def dump_schedules_to_sql(output_path: Path) -> int:
    """Выгружает таблицу schedules в SQL-файл (INSERT-ами)."""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM schedules ORDER BY id")
        
    if not rows:
        print("⚠️ База пуста, дамп не создан.")
        return 0

    print(f"-> Генерируем init.sql ({len(rows)} записей)...")
    
    def esc(val):
        """Экранирует значения для SQL. Всё, кроме чисел и NULL, берем в кавычки."""
        if val is None:
            return "NULL"
        if isinstance(val, (int, float)):
            return str(val)
        # Для str, datetime.time, datetime.date и всего остального
        safe_str = str(val).replace("'", "''")
        return "'" + safe_str + "'"

    # SQL для создания таблицы
    create_table_sql = (
        "CREATE TABLE IF NOT EXISTS schedules (\n"
        "    id              BIGSERIAL PRIMARY KEY,\n"
        "    station_id      TEXT        NOT NULL,\n"
        "    line_id         TEXT        NOT NULL,\n"
        "    thread_uid      TEXT        NOT NULL,\n"
        "    train_number    TEXT        NOT NULL,\n"
        "    train_type      TEXT        NOT NULL,\n"
        "    origin          TEXT        NOT NULL,\n"
        "    destination     TEXT        NOT NULL,\n"
        "    direction       TEXT        NOT NULL,\n"
        "    departure       TIME        NOT NULL,\n"
        "    arrival         TIME,\n"
        "    days_mask       SMALLINT    NOT NULL,\n"
        "    platform        TEXT,\n"
        "    track           TEXT,\n"
        "    fetched_at      TIMESTAMPTZ DEFAULT now(),\n"
        "    CONSTRAINT schedules_uq UNIQUE (station_id, thread_uid, departure)\n"
        ");\n"
    )

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("-- Auto-generated schedule dump\n")
        f.write(create_table_sql)
        f.write("TRUNCATE TABLE schedules RESTART IDENTITY CASCADE;\n\n")
        
        for r in rows:
            vals = [
                esc(r["station_id"]), esc(r["line_id"]), esc(r["thread_uid"]),
                esc(r["train_number"]), esc(r["train_type"]), esc(r["origin"]),
                esc(r["destination"]), esc(r["direction"]), esc(r["departure"]),
                esc(r["arrival"]), esc(r["days_mask"]), esc(r["platform"]),
                esc(r["track"]), esc(r["fetched_at"])
            ]
            
            insert_sql = (
                f"INSERT INTO schedules (station_id, line_id, thread_uid, train_number, train_type, "
                f"origin, destination, direction, departure, arrival, days_mask, platform, track, fetched_at) "
                f"VALUES ({', '.join(vals)});\n"
            )
            f.write(insert_sql)
            
        f.write("\nSELECT setval(pg_get_serial_sequence('schedules', 'id'), coalesce(max(id), 1), max(id) IS NOT NULL) FROM schedules;\n")
    
    return len(rows)


async def main(directions: list[str]):
    await init_pool(os.environ["DATABASE_URL"])
    
    try:
        for d_id in directions:
            print(f"\n=== Скачиваем {d_id} ===")
            try:
                n = await fetch_direction(None, d_id)
                print(f"✅ {d_id}: скачано {n} рейсов")
            except QuotaExceeded:
                print("❌ Квота Яндекса исчерпана! Остановись на сегодня.")
                break
            except Exception as e:
                print(f"❌ Ошибка на {d_id}: {e}")
                
        # Делаем дамп после скачивания
        sql_path = Path(__file__).parent.parent / "init.sql"
        count = await dump_schedules_to_sql(sql_path)
        print(f"\n✅ SQL-файл обновлен: {sql_path} ({count} строк)")

    finally:
        await close_pool()

    # Пушим в Git
    print("\n=== Отправляем в GitHub ===")
    try:
        repo_root = Path(__file__).parent.parent.parent
        subprocess.run(["git", "-C", str(repo_root), "add", "backend/init.sql"], check=True)
        subprocess.run(["git", "-C", str(repo_root), "commit", "-m", f"feat: update schedule dump ({', '.join(directions)})"], check=True)
        subprocess.run(["git", "-C", str(repo_root), "push", "origin", "main"], check=True)
        print("✅ Успешно запушено! Cloady пересоберет контейнер через пару минут.")
    except subprocess.CalledProcessError:
        print("⚠️ Git не нашел изменений (возможно, база не обновилась).")


if __name__ == "__main__":
    args = sys.argv[1:]
    
    if not args:
        from app.schedule.directions import WEEKLY_ROTATION
        weekday = datetime.datetime.now().weekday()
        directions = WEEKLY_ROTATION.get(weekday, [])
        
        if not directions:
            print("Сегодня выходной по графику.")
            sys.exit(0)
            
        args = directions
        print(f"Авто-режим. Качаем: {', '.join(args)}")

    asyncio.run(main(args))