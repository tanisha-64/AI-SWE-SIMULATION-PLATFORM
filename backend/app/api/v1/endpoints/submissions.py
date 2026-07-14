from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.submission import CodeRunRequest, SubmissionOut
from app.services.submission_service import submit_code, get_user_submissions, get_submission_by_id
from app.utils.jwt_handler import get_current_user
from app.utils.rate_limiter import rate_limit
from app.models.user import User

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("/", response_model=SubmissionOut)
def create_submission(
    request: CodeRunRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(rate_limit(max_requests=10, window_seconds=60))
):
    return submit_code(db, current_user.id, request, background_tasks)


@router.get("/", response_model=List[SubmissionOut])
def list_my_submissions(
    problem_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_submissions(db, current_user.id, problem_id)


@router.get("/{submission_id}", response_model=SubmissionOut)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_submission_by_id(db, current_user.id, submission_id)