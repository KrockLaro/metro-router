"""Отправить задачу фетча в очередь arq.

Использование:
    python -m scripts.trigger_fetch yaroslavskoye
    python -m scripts.trigger_fetch paveletskoye
"""
import asyncio
import sys

from dotenv import load_dotenv
load_dotenv()

from arq import create_pool
from app.schedule.worker import REDIS_SETTINGS


async def trigger(direction: str) -> None:
    redis = await create_pool(REDIS_SETTINGS)
    try:
        job = await redis.enqueue_job('fetch_direction', direction)
        print(f'Задача отправлена: {job.job_id}')
    finally:
        await redis.close()   # ← корректно закрываем соединение


if __name__ == "__main__":
    direction = sys.argv[1] if len(sys.argv) > 1 else "yaroslavskoye"
    asyncio.run(trigger(direction))