from pydantic import BaseModel
from typing import List, Dict, Optional


class CategoryStat(BaseModel):
    solved: int
    accuracy: float


class AnalyticsOut(BaseModel):
    total_problems_solved: int
    total_submissions: int
    accuracy_percentage: float
    debugging_challenges_solved: int
    avg_hints_used: float
    category_breakdown: Dict[str, CategoryStat]
    strengths: List[str]
    weaknesses: List[str]
    consistency_score: float
    avg_code_quality_score: float
    industry_readiness_score: float

    class Config:
        from_attributes = True
        

class StreakInfo(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: Optional[str] = None


class CalendarDay(BaseModel):
    date: str
    submissions_count: int


class BadgeOut(BaseModel):
    name: str
    description: str
    earned_at: str