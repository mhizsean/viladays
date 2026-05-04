from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_EXTRA_ORIGINS: str = ""

    model_config = {
        "env_file": ".env"
    }


settings = Settings()
