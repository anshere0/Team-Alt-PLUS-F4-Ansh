from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.security import get_current_user
from app.core.database import get_db
from app.db.models.user import User
from app.schemas.grid import SubstationResponse, FeederResponse, TransformerResponse, SmartMeterResponse
from app.services import grid_service

router = APIRouter()

@router.get("/substations", response_model=List[SubstationResponse])
async def get_substations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all substations."""
    return await grid_service.get_all_substations(db)

@router.get("/feeders", response_model=List[FeederResponse])
async def get_feeders(
    substation_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve feeders, optionally filtered by substation_id."""
    return await grid_service.get_feeders(db, substation_id)

@router.get("/transformers", response_model=List[TransformerResponse])
async def get_transformers(
    feeder_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve transformers, optionally filtered by feeder_id."""
    return await grid_service.get_transformers(db, feeder_id)

@router.get("/meters", response_model=List[SmartMeterResponse])
async def get_meters(
    transformer_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve smart meters, optionally filtered by transformer_id."""
    return await grid_service.get_smart_meters(db, transformer_id)
