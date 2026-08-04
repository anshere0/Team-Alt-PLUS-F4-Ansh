import asyncio
from loguru import logger
from app.services.simulator import run_simulation
from app.core.config import settings
from app.db.base import Base
from app.core.database import engine

async def init_db():
    # Only useful if we wanted to auto-create tables, but alembic handles this.
    pass

async def main():
    logger.info("Starting GridGuard AI Simulation Worker...")
    try:
        await run_simulation()
    except asyncio.CancelledError:
        logger.info("Simulation Worker shutdown requested.")
    except Exception as e:
        logger.exception(f"Simulation Worker encountered a fatal error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Simulation Worker stopped by user.")
