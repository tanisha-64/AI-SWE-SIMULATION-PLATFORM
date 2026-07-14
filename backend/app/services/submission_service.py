from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.submission import Submission
from app.models.problem import Problem
from app.services.code_execution_service import code_executor
from app.services.analytics_service import recalculate_user_analytics
from app.services.streak_service import record_activity
from app.services.ai.code_review_service import get_ai_code_review
from app.schemas.submission import CodeRunRequest
from app.core.database import SessionLocal


def run_code_sample(db: Session, user_id: int, request: CodeRunRequest) -> dict:
    problem = db.query(Problem).filter(Problem.id == request.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    sample_cases = [tc for tc in problem.test_cases if tc.get("is_sample")]

    execution_result = code_executor.run_test_cases(
        code=request.code,
        language=request.language,
        test_cases=sample_cases
    )
    return execution_result


def _generate_ai_review_background(submission_id: int, problem_title: str, problem_description: str, code: str, language: str):
    """
    Runs in the background after the response is already sent to the user.
    Opens its own DB session since the original request's session is closed by then.
    """
    db = SessionLocal()
    try:
        ai_review = get_ai_code_review(
            problem_title=problem_title,
            problem_description=problem_description,
            code=code,
            language=language
        )
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if submission:
            submission.ai_review = ai_review
            db.commit()
    finally:
        db.close()


def submit_code(db: Session, user_id: int, request: CodeRunRequest, background_tasks: BackgroundTasks) -> Submission:
    problem = db.query(Problem).filter(Problem.id == request.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    execution_result = code_executor.run_test_cases(
        code=request.code,
        language=request.language,
        test_cases=problem.test_cases
    )

    passed_count = execution_result["passed_count"]
    total_count = execution_result["total_count"]

    if passed_count == total_count:
        final_status = "passed"
    elif passed_count == 0:
        final_status = "failed"
    else:
        final_status = "partial"

    new_submission = Submission(
        user_id=user_id,
        problem_id=request.problem_id,
        code=request.code,
        language=request.language,
        status=final_status,
        test_results=execution_result["results"],
        passed_count=passed_count,
        total_count=total_count,
        execution_time_ms=execution_result["total_execution_time_ms"],
        ai_review=None
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    background_tasks.add_task(
        _generate_ai_review_background,
        new_submission.id,
        problem.title,
        problem.description,
        request.code,
        request.language
    )

    record_activity(db, user_id)
    recalculate_user_analytics(db, user_id)

    return new_submission


def get_user_submissions(db: Session, user_id: int, problem_id: int = None):
    query = db.query(Submission).filter(Submission.user_id == user_id)
    if problem_id:
        query = query.filter(Submission.problem_id == problem_id)
    return query.order_by(Submission.created_at.desc()).all()


def get_submission_by_id(db: Session, user_id: int, submission_id: int) -> Submission:
    submission = db.query(Submission).filter(
        Submission.id == submission_id, Submission.user_id == user_id
    ).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission