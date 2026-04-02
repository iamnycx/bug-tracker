from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    SECRET_KEY: str = "dev-secret"
    JWT_SECRET_KEY: str = "dev-jwt-secret-change-this-to-32-plus-chars"
    JWT_ACCESS_TOKEN_EXPIRES_MINUTES: int = 120
    DATABASE_URL: str = "sqlite:///dev.db"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:5173"
    ADMIN_NAME: str = "Admin"
    ADMIN_EMAIL: str = "admin@bugtracker.local"
    ADMIN_PASSWORD: str = "admin12345"


settings = Settings()
