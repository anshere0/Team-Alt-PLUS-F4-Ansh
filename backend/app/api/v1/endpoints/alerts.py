
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.db.models.user import User
from app.schemas.alert import AlertResponse, AuditLogResponse, ResolveAlertRequest
from app.services import alert_service

router = APIRouter()

@router.get("/")
async def get_active_alerts(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve active un-resolved alerts."""
    return await alert_service.get_active_alerts(db, skip, limit)

@router.put("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    request: ResolveAlertRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resolve an alert and create an audit log."""
    alert = await alert_service.resolve_alert(db, alert_id, current_user.id, request.notes)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "success", "message": "Alert resolved"}

@router.get("/audit", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve system audit logs for compliance tracking."""
    return await alert_service.get_audit_logs(db, skip, limit)
