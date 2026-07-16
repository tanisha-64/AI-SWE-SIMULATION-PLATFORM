from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 🌟 Neon database connection drops ko handle karne ke liye parameters add kiye hain
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Har query chalane se pehle connection test karega
    pool_recycle=300,        # Har 5 minute (300 seconds) mein purane connections ko fresh karega
    pool_size=5,             # Active connections ki limit set karega
    max_overflow=10          # Traffic badhne par temporary extra connections allow karega
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()