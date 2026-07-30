from datetime import datetime, timezone
import uuid
from sqlalchemy import String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum
from app.db.base import Base

class Role(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    ENGINEER = "ENGINEER"
    INSPECTOR = "INSPECTOR"
    VIEWER = "VIEWER"

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[Role] = mapped_column(SQLEnum(Role))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
