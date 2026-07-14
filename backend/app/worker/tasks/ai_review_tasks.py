from app.worker.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.problem import Problem
from app.models.submission import Submission
from app.services.ai.code_review_service import get_ai_code_review


@celery_app.task(name="generate_ai_review_task")
def generate_ai_review_task(submission_id: int, problem_title: str, problem_description: str, code: str, language: str):
    """
    Background task: generates AI review and updates the submission record.
    Runs in a separate worker process, doesn't block the API response.
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

        return {"submission_id": submission_id, "status": "completed"}

    except Exception as e:
        return {"submission_id": submission_id, "status": "failed", "error": str(e)}

    finally:
        db.close()