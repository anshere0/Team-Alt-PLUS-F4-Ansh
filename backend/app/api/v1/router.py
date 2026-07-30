from fastapi import APIRouter

from app.api.v1.endpoints import ai, alerts, auth, dashboard, grid, predict, ws, topology, upload, simulate

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(grid.router, prefix="/grid", tags=["grid"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(ws.router, prefix="/ws", tags=["websocket"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(predict.router, prefix="/predict", tags=["predict"])
api_router.include_router(topology.router, prefix="/topology", tags=["topology"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(simulate.router, prefix="/simulate", tags=["simulate"])
