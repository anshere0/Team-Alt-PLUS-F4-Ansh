from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.responses import ApiResponse, success_response
from app.core.security import get_current_user
from app.db.models.user import User
from app.schemas.auth import AuthSession, LoginRequest, UserResponse
from app.services.auth_service import authenticate_user

router = APIRouter()

@router.post("/login", response_model=ApiResponse[AuthSession])
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user and return JWT token in standard envelope.
    """
    auth_session = await authenticate_user(request.username, request.password, db)
    return success_response(data=auth_session, message="Login successful")

@router.get("/profile", response_model=ApiResponse[UserResponse])
async def profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile.
    """
    user_response = UserResponse.model_validate(current_user)
    return success_response(data=user_response, message="Profile retrieved successfully")
