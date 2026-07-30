from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.db.models.user import User
from app.services.parser import parse_csv_telemetry, parse_pdf_audit

router = APIRouter()

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload historical telemetry data (CSV) or offline audit logs (PDF)
    for batch ingestion and AI processing.
    """
    filename = file.filename.lower()
    
    if filename.endswith(".csv"):
        return await parse_csv_telemetry(file, db)
    elif filename.endswith(".pdf"):
        return await parse_pdf_audit(file, db)
    else:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Please upload a .csv or .pdf file."
        )
