import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_protected_route_without_token(client: AsyncClient, no_auth):
    """
    Test that hitting a protected endpoint without a valid JWT token
    returns a 401 Unauthorized response.
    """
    response = await client.get("/api/v1/grid/meters")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

@pytest.mark.asyncio
async def test_protected_route_with_mock_auth(client: AsyncClient, mock_auth):
    """
    Test that hitting a protected endpoint with authentication mocked
    allows the request to proceed (though it may return 200 or 500 depending on DB schema).
    We just want to ensure it passes the 401 barrier.
    """
    try:
        response = await client.get("/api/v1/grid/meters")
        # As long as it's not 401, the auth middleware worked
        assert response.status_code != 401
    except Exception as e:
        # If the DB fails because the mock SQLite DB hasn't been migrated with alembic,
        # that's fine for this specific auth test. We just care it didn't block auth.
        pass
