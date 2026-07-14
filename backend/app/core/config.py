from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    REDIS_URL: str = ""
    HF_API_KEY: str = ""
    COHERE_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()