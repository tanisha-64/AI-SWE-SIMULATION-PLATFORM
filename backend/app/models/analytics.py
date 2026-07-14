from sqlalchemy import Column, Integer, Float, ForeignKey, JSON, DateTime, Date, String
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class UserAnalytics(BaseModel):
    __tablename__ = "user_analytics"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    total_problems_solved = Column(Integer, default=0)
    total_submissions = Column(Integer, default=0)
    accuracy_percentage = Column(Float, default=0.0)

    debugging_challenges_solved = Column(Integer, default=0)
    avg_hints_used = Column(Float, default=0.0)

    category_breakdown = Column(JSON, default=dict)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)

    consistency_score = Column(Float, default=0.0)
    avg_code_quality_score = Column(Float, default=0.0)

    industry_readiness_score = Column(Float, default=0.0)
    last_calculated_at = Column(DateTime, nullable=True)

    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_active_date = Column(DateTime, nullable=True)

    user = relationship("User")


class DailyActivity(BaseModel):
    __tablename__ = "daily_activity"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_date = Column(Date, nullable=False)
    problems_solved_count = Column(Integer, default=0)
    submissions_count = Column(Integer, default=0)

    user = relationship("User")


class UserBadge(BaseModel):
    __tablename__ = "user_badges"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_code = Column(String, nullable=False)
    badge_name = Column(String, nullable=False)
    badge_description = Column(String, nullable=False)

    user = relationship("User")