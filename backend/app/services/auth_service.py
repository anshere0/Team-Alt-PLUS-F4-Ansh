from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password
from app.repositories.user_repo import user_repo
from app.schemas.auth import AuthSession, UserResponse


async def authenticate_user(username: str, password: str, db: AsyncSession) -> AuthSession:
    user = await user_repo.get_by_username(db, username)
    
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
