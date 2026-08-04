from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.repositories.base import BaseRepository
from app.db.models.user import User

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    hashed_password: str
    role: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    hashed_password: Optional[str] = None
    role: Optional[str] = None

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(User)
        
    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        query = select(User).where(User.username == username)
        result = await db.execute(query)
        return result.scalars().first()

user_repo = UserRepository()
