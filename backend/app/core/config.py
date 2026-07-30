from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "GridGuard AI Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    OPENAI_API_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    DATABASE_URL: str
    DIRECT_URL: str | None = None
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env.backend", extra="ignore")

settings = Settings()
