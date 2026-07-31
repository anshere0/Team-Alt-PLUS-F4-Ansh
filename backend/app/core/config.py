
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "GridGuard AI Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    OPENAI_API_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    DATABASE_URL: str
    DIRECT_URL: str | None = None
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://team-alt-plus-f4-ansh.vercel.app", "https://team-alt-plus-f4-ansh-epme-ten.vercel.app"]
    AI_SERVICE_URL: str = "http://ai:8001"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
