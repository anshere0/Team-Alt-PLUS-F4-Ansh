from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.core.database import get_db
from app.db.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services import dashboard_service

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get global summary stats for the dashboard."""
    return await dashboard_service.get_dashboard_summary(db)
