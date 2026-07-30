from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.core.config import settings
from app.api.v1.router import api_router
from app.services.simulator import run_simulation

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for load balancers and deployment services."""
    return {"status": "ok", "message": "GridGuard API is running!"}

@app.get("/ready", tags=["System"])
async def ready_check():
    return {"status": "UP"}
