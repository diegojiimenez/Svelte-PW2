from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://127.0.0.1:27017/svelte_pw2"
    JWT_SECRET: str = "secret"
    JWT_EXPIRE: str = "7d"
    PORT: int = 3000
    CORS_ORIGIN: str = "http://localhost:5173"

    model_config = {"env_file": ".env"}


settings = Settings()
