from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.core.database import get_db
from app.db.models.user import User
from app.schemas.ai import ChatRequest, ChatResponse
from app.services import ai_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Chat with the AI Copilot."""
    reply = await ai_service.process_chat(request.message, db)
    return ChatResponse(reply=reply)
