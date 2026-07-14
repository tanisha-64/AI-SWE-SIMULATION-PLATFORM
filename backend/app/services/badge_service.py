from sqlalchemy.orm import Session
from app.models.analytics import UserBadge, UserAnalytics
from app.models.submission import Submission
from app.models.debugging_challenge import DebuggingAttempt


BADGE_DEFINITIONS = [
    {"code": "first_solve", "name": "First Steps", "description": "Solved your first problem", "check": lambda s: s["problems_solved"] >= 1},
    {"code": "ten_solved", "name": "Getting Started", "description": "Solved 10 problems", "check": lambda s: s["problems_solved"] >= 10},
    {"code": "fifty_solved", "name": "Problem Crusher", "description": "Solved 50 problems", "check": lambda s: s["problems_solved"] >= 50},
    {"code": "streak_7", "name": "Week Warrior", "description": "7-day practice streak", "check": lambda s: s["current_streak"] >= 7},
    {"code": "streak_30", "name": "Consistency King/Queen", "description": "30-day practice streak", "check": lambda s: s["current_streak"] >= 30},
    {"code": "first_debug", "name": "Bug Hunter", "description": "Solved your first debugging challenge", "check": lambda s: s["debug_solved"] >= 1},
    {"code": "high_accuracy", "name": "Sharpshooter", "description": "Achieved 90%+ accuracy", "check": lambda s: s["accuracy"] >= 90},
    {"code": "readiness_70", "name": "Interview Ready", "description": "Reached 70+ Industry Readiness Score", "check": lambda s: s["readiness_score"] >= 70},
]


def check_and_award_badges(db: Session, user_id: int) -> list:
    """
    Checks the user's current stats against all badge criteria.
    Awards any newly-earned badges. Returns list of newly awarded badges.
    """
    analytics = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id).first()
    if not analytics:
        return []

    debug_solved = db.query(DebuggingAttempt).filter(
        DebuggingAttempt.user_id == user_id, DebuggingAttempt.status == "solved"
    ).count()

    stats = {
        "problems_solved": analytics.total_problems_solved,
        "current_streak": analytics.current_streak,
        "debug_solved": debug_solved,
        "accuracy": analytics.accuracy_percentage,
        "readiness_score": analytics.industry_readiness_score
    }

    existing_badge_codes = {
        b.badge_code for b in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    }

    newly_awarded = []

    for badge_def in BADGE_DEFINITIONS:
        if badge_def["code"] in existing_badge_codes:
            continue
        if badge_def["check"](stats):
            new_badge = UserBadge(
                user_id=user_id,
                badge_code=badge_def["code"],
                badge_name=badge_def["name"],
                badge_description=badge_def["description"]
            )
            db.add(new_badge)
            newly_awarded.append({"name": badge_def["name"], "description": badge_def["description"]})

    if newly_awarded:
        db.commit()

    return newly_awarded


def get_user_badges(db: Session, user_id: int) -> list:
    badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    return [
        {"name": b.badge_name, "description": b.badge_description, "earned_at": b.created_at.isoformat()}
        for b in badges
    ]