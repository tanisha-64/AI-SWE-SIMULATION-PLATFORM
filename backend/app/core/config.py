from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    REDIS_URL: str = ""
    HF_API_KEY: str = ""
    COHERE_API_KEY: str = ""
    BREVO_API_KEY: str = ""
    BREVO_SENDER_EMAIL: str = "mitanisha74@gmail.com"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # 1. Resend API Key add karein
    RESEND_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        # 2. Extra fields allow/ignore karne ke liye
        extra = "ignore"

settings = Settings()