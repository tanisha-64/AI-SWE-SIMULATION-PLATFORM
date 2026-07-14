from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.analytics import AnalyticsOut
from app.services.analytics_service import get_user_analytics, recalculate_user_analytics
from app.utils.jwt_handler import get_current_user
from app.models.user import User
from typing import List
from app.schemas.problem import ProblemOut
from app.services.ml.recommendation_engine import recommend_problems
from app.schemas.analytics import StreakInfo, CalendarDay, BadgeOut
from app.services.badge_service import get_user_badges
from app.services.streak_service import get_streak_info, get_calendar_heatmap

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/me", response_model=AnalyticsOut)
def my_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_analytics(db, current_user.id)


@router.post("/recalculate", response_model=AnalyticsOut)
def force_recalculate(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return recalculate_user_analytics(db, current_user.id)

@router.get("/recommendations", response_model=List[ProblemOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return recommend_problems(db, current_user.id)


@router.get("/streak", response_model=StreakInfo)
def my_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_streak_info(db, current_user.id)


@router.get("/calendar", response_model=List[CalendarDay])
def my_calendar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_calendar_heatmap(db, current_user.id)


@router.get("/badges", response_model=List[BadgeOut])
def my_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_badges(db, current_user.id)