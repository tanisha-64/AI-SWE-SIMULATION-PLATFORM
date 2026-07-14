from app.services.streak_service import record_activity
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.debugging_challenge import DebuggingChallenge, DebuggingAttempt
from app.services.code_execution_service import code_executor
from app.services.ai.debugging_hint_service import get_debugging_hint
from app.services.analytics_service import recalculate_user_analytics


def get_all_challenges(db: Session, difficulty: str = None):
    query = db.query(DebuggingChallenge)
    if difficulty:
        query = query.filter(DebuggingChallenge.difficulty == difficulty)
    return query.all()


def get_challenge_by_id(db: Session, challenge_id: int) -> DebuggingChallenge:
    challenge = db.query(DebuggingChallenge).filter(DebuggingChallenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Debugging challenge not found")
    return challenge


def _get_or_create_attempt(db: Session, user_id: int, challenge_id: int) -> DebuggingAttempt:
    attempt = db.query(DebuggingAttempt).filter(
        DebuggingAttempt.user_id == user_id,
        DebuggingAttempt.challenge_id == challenge_id
    ).first()

    if not attempt:
        challenge = get_challenge_by_id(db, challenge_id)
        attempt = DebuggingAttempt(
            user_id=user_id,
            challenge_id=challenge_id,
            current_code=challenge.broken_code,
            hints_used=0,
            hint_history=[]
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

    return attempt


def request_hint(db: Session, user_id: int, challenge_id: int, current_code: str) -> dict:
    challenge = get_challenge_by_id(db, challenge_id)
    attempt = _get_or_create_attempt(db, user_id, challenge_id)

    attempt.hints_used += 1
    next_hint_level = min(attempt.hints_used, 3)

    hint = get_debugging_hint(
        problem_description=challenge.description,
        bug_explanation=challenge.bug_explanation,
        user_attempt=current_code,
        hint_level=next_hint_level
    )

    attempt.current_code = current_code
    attempt.hint_history = attempt.hint_history + [hint]
    db.commit()

    return {
        "hint_text": hint["hint_text"],
        "hint_level": hint["hint_level"],
        "hints_used_total": attempt.hints_used
    }


def submit_debug_fix(db: Session, user_id: int, challenge_id: int, code: str) -> dict:
    challenge = get_challenge_by_id(db, challenge_id)
    attempt = _get_or_create_attempt(db, user_id, challenge_id)

    execution_result = code_executor.run_test_cases(
        code=code,
        language=challenge.language,
        test_cases=challenge.test_cases
    )

    passed_count = execution_result["passed_count"]
    total_count = execution_result["total_count"]

    attempt.current_code = code
    attempt.status = "solved" if passed_count == total_count else "in_progress"
    db.commit()
    record_activity(db, user_id)
    recalculate_user_analytics(db, user_id)

    return {
        "status": attempt.status,
        "passed_count": passed_count,
        "total_count": total_count,
        "test_results": execution_result["results"]
    }