from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.user import User
from app.core.security import verify_password, create_access_token
from app.schemas.auth import AuthSession, UserResponse
from fastapi import HTTPException, status

async def authenticate_user(username: str, password: str, db: AsyncSession) -> AuthSession:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.id, role=user.role.value)
    
    user_response = UserResponse.model_validate(user)
    
    return AuthSession(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )
