from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict
from app.models.submission import Submission, McqAttempt
from app.models.debugging_challenge import DebuggingAttempt
from app.models.analytics import UserAnalytics
from app.models.problem import Problem


def _calculate_category_breakdown(db: Session, user_id: int) -> dict:
    """Combines coding submissions AND MCQ attempts into one category breakdown."""
    category_stats = defaultdict(lambda: {"total": 0, "passed": 0})

    # Coding submissions
    coding_rows = (
        db.query(Submission, Problem)
        .join(Problem, Submission.problem_id == Problem.id)
        .filter(Submission.user_id == user_id)
        .all()
    )
    for submission, problem in coding_rows:
        category_stats[problem.category]["total"] += 1
        if submission.status == "passed":
            category_stats[problem.category]["passed"] += 1

    # MCQ attempts
    mcq_rows = (
        db.query(McqAttempt, Problem)
        .join(Problem, McqAttempt.problem_id == Problem.id)
        .filter(McqAttempt.user_id == user_id)
        .all()
    )
    for attempt, problem in mcq_rows:
        category_stats[problem.category]["total"] += 1
        if attempt.is_correct == "True" or attempt.is_correct is True:
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
    strengths = []
    weaknesses = []
    for category, stats in category_breakdown.items():
        if stats["accuracy"] >= 75:
            strengths.append(category)
        elif stats["accuracy"] < 50:
            weaknesses.append(category)
    return strengths, weaknesses


def _calculate_consistency_score(db: Session, user_id: int) -> float:
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == user_id, Submission.created_at >= thirty_days_ago)
        .all()
    )
    mcq_attempts = (
        db.query(McqAttempt)
        .filter(McqAttempt.user_id == user_id, McqAttempt.created_at >= thirty_days_ago)
        .all()
    )

    active_days = set()
    for s in submissions:
        active_days.add(s.created_at.date())
    for m in mcq_attempts:
        active_days.add(m.created_at.date())

    if not active_days:
        return 0.0

    consistency = (len(active_days) / 30) * 100
    return round(min(consistency, 100.0), 1)


def _calculate_avg_code_quality(db: Session, user_id: int) -> float:
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
    accuracy: float, total_solved: int, consistency: float,
    avg_code_quality: float, debugging_solved: int
) -> float:
    volume_score = min(total_solved / 50 * 100, 100)
    quality_score = (avg_code_quality / 10) * 100 if avg_code_quality > 0 else 0
    debugging_score = min(debugging_solved / 10 * 100, 100)

    readiness = (
        accuracy * 0.30 +
        volume_score * 0.25 +
        consistency * 0.20 +
        quality_score * 0.15 +
        debugging_score * 0.10
    )
    return round(min(readiness, 100.0), 1)


def recalculate_user_analytics(db: Session, user_id: int) -> UserAnalytics:
    # Coding submissions
    total_coding_submissions = db.query(Submission).filter(Submission.user_id == user_id).count()
    passed_coding_submissions = db.query(Submission).filter(
        Submission.user_id == user_id, Submission.status == "passed"
    ).count()
    distinct_coding_solved = (
        db.query(Submission.problem_id)
        .filter(Submission.user_id == user_id, Submission.status == "passed")
        .distinct()
        .count()
    )

    # MCQ attempts
    total_mcq_attempts = db.query(McqAttempt).filter(McqAttempt.user_id == user_id).count()
    correct_mcq_attempts = db.query(McqAttempt).filter(
        McqAttempt.user_id == user_id, McqAttempt.is_correct.in_(["True", "true"])
    ).count()
    distinct_mcq_solved = (
        db.query(McqAttempt.problem_id)
        .filter(McqAttempt.user_id == user_id, McqAttempt.is_correct.in_(["True", "true"]))
        .distinct()
        .count()
    )

    # Combined totals (coding + MCQ count toward "problems solved" and accuracy)
    total_attempts = total_coding_submissions + total_mcq_attempts
    total_correct = passed_coding_submissions + correct_mcq_attempts
    total_solved = distinct_coding_solved + distinct_mcq_solved

    accuracy = (total_correct / total_attempts * 100) if total_attempts > 0 else 0.0

    # Debugging challenges (tracked separately, not part of "solved" count)
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
        analytics = UserAnalytics(user_id=user_id, current_streak=0, longest_streak=0)
        db.add(analytics)
        db.commit()
        db.refresh(analytics)

    analytics.total_problems_solved = total_solved
    analytics.total_submissions = total_attempts
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

    from app.services.badge_service import check_and_award_badges
    check_and_award_badges(db, user_id)

    return analytics


def get_user_analytics(db: Session, user_id: int) -> UserAnalytics:
    analytics = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id).first()
    if not analytics:
        analytics = recalculate_user_analytics(db, user_id)
    return analytics