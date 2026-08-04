import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import get_db
from app.core.security import get_current_user
from app.db.models.user import User

# Using SQLite memory for fast, isolated async testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

async def override_get_current_user():
    return User(
        id="test-user-id",
        email="test@gridguard.io",
        name="Test Operator",
        role="ADMIN",
        is_active=True
    )

@pytest.fixture
def mock_auth():
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)

@pytest.fixture
def no_auth():
    # Keep default dependency that checks JWT, overriding any existing overrides
    app.dependency_overrides.pop(get_current_user, None)
    yield

@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    # We don't override the DB for simple route tests, but we could
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
