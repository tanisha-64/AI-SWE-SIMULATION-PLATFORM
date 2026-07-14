from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.submission import CodeRunRequest
from app.services.submission_service import run_code_sample
from app.utils.jwt_handler import get_current_user
from app.models.user import User
from app.services.trace_service import execution_tracer
from app.schemas.submission import TraceResponse

router = APIRouter(prefix="/execute", tags=["Code Execution"])


@router.post("/run")
def run_code(
    request: CodeRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return run_code_sample(db, current_user.id, request)

@router.post("/trace", response_model=TraceResponse)
def trace_code(
    request: CodeRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return execution_tracer.trace_execution(request.code, "")