from sqlalchemy.orm import Session
from app.services.ml.recommendation_engine import recommend_problems


def recommend_problems_tool(db: Session, user_id: int, limit: int = 3) -> list:
    """Tool: Gets personalized problem recommendations based on weaknesses."""
    problems = recommend_problems(db, user_id, limit)
    return [
        {"id": p.id, "title": p.title, "difficulty": p.difficulty, "category": p.category}
        for p in problems
    ]