from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict
from app.models.submission import Submission
from app.models.debugging_challenge import DebuggingAttempt
from app.services.badge_service import check_and_award_badges
from app.models.analytics import UserAnalytics
from app.models.problem import Problem


def _calculate_category_breakdown(db: Session, user_id: int) -> dict:
    """Groups submissions by problem category and calculates per-category accuracy."""
    submissions = (
        db.query(Submission, Problem)
        .join(Problem, Submission.problem_id == Problem.id)
        .filter(Submission.user_id == user_id)
        .all()
    )

    category_stats = defaultdict(lambda: {"total": 0, "passed": 0})

    for submission, problem in submissions:
        category_stats[problem.category]["total"] += 1
        if submission.status == "passed":
            category_stats[problem.category]["passed"] += 1

    breakdown = {}
    for category, stats in category_stats.items():
        accuracy = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0
        breakdown[category] = {
            "solved": stats["passed"],
            "accuracy": round(accuracy, 1)
        }

    return breakdown


def _identify_strengths_weaknesses(category_breakdown: dict) -> tuple:
    """Categories with accuracy >= 75% are strengths, < 50% are weaknesses."""
    strengths = []
    weaknesses = []

    for category, stats in category_breakdown.items():
        if stats["accuracy"] >= 75:
            strengths.append(category)
        elif stats["accuracy"] < 50:
            weaknesses.append(category)

    return strengths, weaknesses


def _calculate_consistency_score(db: Session, user_id: int) -> float:
    """
    Measures how regularly the user practices over the last 30 days.
    More active days = higher consistency score (0-100).
    """
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == user_id, Submission.created_at >= thirty_days_ago)
        .all()
    )

    if not submissions:
        return 0.0

    active_days = set()
    for s in submissions:
        active_days.add(s.created_at.date())

    consistency = (len(active_days) / 30) * 100
    return round(min(consistency, 100.0), 1)


def _calculate_avg_code_quality(db: Session, user_id: int) -> float:
    """Averages the AI-given code_quality_score across all submissions that have one."""
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == user_id, Submission.ai_review.isnot(None))
        .all()
    )

    scores = []
    for s in submissions:
        score = s.ai_review.get("code_quality_score") if s.ai_review else None
        if score is not None:
            scores.append(score)

    if not scores:
        return 0.0

    return round(sum(scores) / len(scores), 1)


def _calculate_readiness_score(
    accuracy: float,
    total_solved: int,
    consistency: float,
    avg_code_quality: float,
    debugging_solved: int
) -> float:
    """
    Composite Industry Readiness Score (0-100).

    This is a rule-based formula acting as the 'cold-start' model.
    Weights are chosen based on what typically matters for interview readiness:
    - Accuracy (correctness): 30%
    - Volume/practice (solved count, capped): 25%
    - Consistency (regularity): 20%
    - Code quality (from AI reviews, scaled to 100): 15%
    - Debugging skill: 10%
    """
    volume_score = min(total_solved / 50 * 100, 100)  # 50+ problems = full marks
    quality_score = (avg_code_quality / 10) * 100 if avg_code_quality > 0 else 0
    debugging_score = min(debugging_solved / 10 * 100, 100)  # 10+ debug challenges = full marks

    readiness = (
        accuracy * 0.30 +
        volume_score * 0.25 +
        consistency * 0.20 +
        quality_score * 0.15 +
        debugging_score * 0.10
    )

    return round(min(readiness, 100.0), 1)


def recalculate_user_analytics(db: Session, user_id: int) -> UserAnalytics:
    """
    Main function: recalculates everything and saves/updates the UserAnalytics row.
    Call this after every submission or debugging attempt.
    """
    total_submissions = db.query(Submission).filter(Submission.user_id == user_id).count()
    passed_submissions = db.query(Submission).filter(
        Submission.user_id == user_id, Submission.status == "passed"
    ).count()

    total_solved = (
        db.query(Submission.problem_id)
        .filter(Submission.user_id == user_id, Submission.status == "passed")
        .distinct()
        .count()
    )

    accuracy = (passed_submissions / total_submissions * 100) if total_submissions > 0 else 0.0

    debugging_solved = db.query(DebuggingAttempt).filter(
        DebuggingAttempt.user_id == user_id, DebuggingAttempt.status == "solved"
    ).count()

    debugging_attempts = db.query(DebuggingAttempt).filter(DebuggingAttempt.user_id == user_id).all()
    avg_hints = (
        sum(a.hints_used for a in debugging_attempts) / len(debugging_attempts)
        if debugging_attempts else 0.0
    )

    category_breakdown = _calculate_category_breakdown(db, user_id)
    strengths, weaknesses = _identify_strengths_weaknesses(category_breakdown)
    consistency = _calculate_consistency_score(db, user_id)
    avg_code_quality = _calculate_avg_code_quality(db, user_id)

    readiness_score = _calculate_readiness_score(
        accuracy=accuracy,
        total_solved=total_solved,
        consistency=consistency,
        avg_code_quality=avg_code_quality,
        debugging_solved=debugging_solved
    )

    analytics = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id).first()
    if not analytics:
        analytics = UserAnalytics(user_id=user_id)
        db.add(analytics)

    analytics.total_problems_solved = total_solved
    analytics.total_submissions = total_submissions
    analytics.accuracy_percentage = round(accuracy, 1)
    analytics.debugging_challenges_solved = debugging_solved
    analytics.avg_hints_used = round(avg_hints, 1)
    analytics.category_breakdown = category_breakdown
    analytics.strengths = strengths
    analytics.weaknesses = weaknesses
    analytics.consistency_score = consistency
    analytics.avg_code_quality_score = avg_code_quality
    analytics.industry_readiness_score = readiness_score
    analytics.last_calculated_at = datetime.utcnow()

    db.commit()
    db.refresh(analytics)
    check_and_award_badges(db, user_id)

    return analytics


def get_user_analytics(db: Session, user_id: int) -> UserAnalytics:
    analytics = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id).first()
    if not analytics:
        analytics = recalculate_user_analytics(db, user_id)
    return analytics