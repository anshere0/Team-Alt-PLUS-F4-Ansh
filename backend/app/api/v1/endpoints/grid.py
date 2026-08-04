
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.db.models.user import User
from app.schemas.grid import (
    FeederResponse,
    SmartMeterResponse,
    SubstationResponse,
    TransformerResponse,
)
from app.services import grid_service

router = APIRouter()

@router.get("/substations", response_model=list[SubstationResponse])
async def get_substations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all substations."""
    return await grid_service.get_all_substations(db, skip, limit)

@router.get("/feeders", response_model=list[FeederResponse])
async def get_feeders(
    substation_id: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve feeders, optionally filtered by substation_id."""
    return await grid_service.get_feeders(db, substation_id, skip, limit)

@router.get("/transformers", response_model=list[TransformerResponse])
async def get_transformers(
    feeder_id: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve transformers, optionally filtered by feeder_id."""
    return await grid_service.get_transformers(db, feeder_id, skip, limit)

@router.get("/meters", response_model=list[SmartMeterResponse])
async def get_meters(
    transformer_id: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve smart meters, optionally filtered by transformer_id."""
    return await grid_service.get_smart_meters(db, transformer_id, skip, limit)
