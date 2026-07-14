from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.services.problem_service import get_daily_mcqs
from app.db.session import get_db
from app.schemas.problem import (
    ProblemCreate, ProblemOut, ProblemDetail,
    GenerateProblemRequest, MCQSubmitRequest, MCQSubmitOut
)
from app.services.problem_service import (
    create_problem, get_all_problems, get_problem_by_id,
    generate_and_save_bulk, submit_mcq_answer, search_problems
)
from app.utils.jwt_handler import get_current_user
from app.utils.rate_limiter import rate_limit
from app.models.user import User
from app.models.problem import Problem

router = APIRouter(prefix="/problems", tags=["Problems"])

@router.post("/", response_model=ProblemDetail)
def add_problem(
    problem_data: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_problem(db, problem_data)


@router.post("/generate", response_model=List[ProblemDetail])
def generate_problems(
    request: GenerateProblemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(rate_limit(max_requests=5, window_seconds=60))
):
    return generate_and_save_bulk(db, request.category, request.difficulty, request.problem_type, request.count)


@router.get("/", response_model=List[ProblemOut])
def list_problems(
    difficulty: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    problem_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_problems(db, difficulty, category, problem_type)


@router.get("/search", response_model=List[ProblemOut])
def search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return search_problems(db, q)


@router.get("/company-tags/list")
def list_company_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tags = db.query(Problem.company_style_tag).filter(Problem.company_style_tag.isnot(None)).distinct().all()
    return {"company_tags": [t[0] for t in tags if t[0]]}


@router.get("/daily-mcq/today", response_model=List[ProblemDetail])
def daily_mcq_challenge(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_daily_mcqs(db, current_user.id)


@router.get("/{problem_id}", response_model=ProblemDetail)
def get_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_problem_by_id(db, problem_id)
    

@router.post("/mcq/submit", response_model=MCQSubmitOut)
def submit_mcq(
    request: MCQSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return submit_mcq_answer(db, current_user.id, request.problem_id, request.selected_index)
