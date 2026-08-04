from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.db.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import DashboardService
from app.repositories.dashboard_repo import DashboardRepository

router = APIRouter()

def get_dashboard_service():
    repo = DashboardRepository()
    return DashboardService(repo)

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Get global summary stats for the dashboard."""
    return await service.get_dashboard_summary(db)
