from sqlalchemy.orm import Session
from app.services.analytics_service import get_user_analytics


def get_user_analytics_tool(db: Session, user_id: int) -> dict:
    """Tool: Fetches the user's current performance analytics."""
    analytics = get_user_analytics(db, user_id)
    return {
        "total_problems_solved": analytics.total_problems_solved,
        "accuracy_percentage": analytics.accuracy_percentage,
        "strengths": analytics.strengths,
        "weaknesses": analytics.weaknesses,
        "industry_readiness_score": analytics.industry_readiness_score,
        "consistency_score": analytics.consistency_score
    }