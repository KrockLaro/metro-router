import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool
from app.scripts.auto_sync import dump_schedules_to_sql # Берем функцию из нашего скрипта

async def main():
    await init_pool(os.environ["DATABASE_URL"])
    try:
        sql_path = Path(__file__).parent.parent / "init.sql"
        count = await dump_schedules_to_sql(sql_path)
        print(f"✅ Файл пересоздан! Записей: {count}")
    finally:
        await close_pool()

if __name__ == "__main__":
    asyncio.run(main())