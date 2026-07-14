from sqlalchemy.orm import Session
from typing import List
from app.models.problem import Problem
from app.models.submission import Submission
from app.services.analytics_service import get_user_analytics


def _get_target_difficulty(accuracy: float) -> str:
    """Calibrates difficulty based on user's current accuracy — adaptive learning core logic."""
    if accuracy >= 80:
        return "hard"
    elif accuracy >= 55:
        return "medium"
    else:
        return "easy"


def recommend_problems(db: Session, user_id: int, limit: int = 5) -> List[Problem]:
    """
    Core recommendation algorithm:
    1. Prioritize weak categories (targeted improvement)
    2. Calibrate difficulty to current skill level (not too easy, not too hard)
    3. Exclude already-solved problems (avoid repetition)
    4. Fallback to general problems if no weaknesses identified yet
    """
    analytics = get_user_analytics(db, user_id)

    solved_problem_ids = (
        db.query(Submission.problem_id)
        .filter(Submission.user_id == user_id, Submission.status == "passed")
        .distinct()
        .all()
    )
    solved_ids = [pid for (pid,) in solved_problem_ids]

    target_difficulty = _get_target_difficulty(analytics.accuracy_percentage)
    weak_categories = analytics.weaknesses

    query = db.query(Problem).filter(
        Problem.problem_type == "coding",
        ~Problem.id.in_(solved_ids) if solved_ids else True
    )

    recommendations = []

    if weak_categories:
        weak_query = query.filter(
            Problem.category.in_(weak_categories),
            Problem.difficulty == target_difficulty
        )
        recommendations = weak_query.limit(limit).all()

    if len(recommendations) < limit:
        remaining = limit - len(recommendations)
        already_picked_ids = [p.id for p in recommendations]

        fallback_query = query.filter(
            Problem.difficulty == target_difficulty,
            ~Problem.id.in_(already_picked_ids) if already_picked_ids else True
        )
        fallback = fallback_query.limit(remaining).all()
        recommendations.extend(fallback)

    return recommendations