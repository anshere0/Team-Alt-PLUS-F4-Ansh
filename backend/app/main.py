import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.services.simulator import run_simulation
from app.core.rate_limit import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create simulator task
    simulator_task = asyncio.create_task(run_simulation())
    yield
    # Shutdown: Cancel simulator task
    simulator_task.cancel()
    try:
        await simulator_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for load balancers and deployment services."""
    return {"status": "ok", "message": "GridGuard API is running!"}

@app.get("/health/db", tags=["health"])
async def health_db():
    from app.core.database import AsyncSessionLocal
    from sqlalchemy import text
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/health/redis", tags=["health"])
async def health_redis():
    return {"status": "ok", "message": "Redis is optional and not currently configured."}

@app.get("/health/ai", tags=["health"])
async def health_ai():
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.AI_SERVICE_URL}/health", timeout=2.0)
            if response.status_code == 200:
                return {"status": "ok"}
            return {"status": "error", "detail": f"AI responded with {response.status_code}"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/health/full", tags=["health"])
async def health_full():
    db = await health_db()
    redis = await health_redis()
    ai = await health_ai()
    return {
        "status": "ok" if db["status"] == "ok" and ai["status"] == "ok" else "error",
        "components": {
            "db": db,
            "redis": redis,
            "ai": ai
        }
    }

@app.get("/ready", tags=["System"])
async def ready_check():
    return {"status": "UP"}
