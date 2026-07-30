
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.db.models.user import User
from app.schemas.alert import AlertResponse
from app.services import alert_service

router = APIRouter()

@router.get("/", response_model=list[AlertResponse])
async def get_active_alerts(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve active un-resolved alerts."""
    return await alert_service.get_active_alerts(db, limit)
