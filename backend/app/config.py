from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret"
    DATABASE_URL: str = "sqlite:///dev.db"
    DEBUG: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
