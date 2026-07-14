from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.debugging import (
    DebugChallengeOut, HintRequest, HintOut,
    DebugSubmitRequest, DebugSubmitOut
)
from app.services.debugging_service import (
    get_all_challenges, get_challenge_by_id, request_hint, submit_debug_fix
)
from app.utils.jwt_handler import get_current_user
from app.models.user import User

router = APIRouter(prefix="/debug-arena", tags=["Debugging Arena"])


@router.get("/", response_model=List[DebugChallengeOut])
def list_challenges(
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_challenges(db, difficulty)


@router.get("/{challenge_id}", response_model=DebugChallengeOut)
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_challenge_by_id(db, challenge_id)


@router.post("/hint", response_model=HintOut)
def get_hint(
    request: HintRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return request_hint(db, current_user.id, request.challenge_id, request.current_code)


@router.post("/submit", response_model=DebugSubmitOut)
def submit_fix(
    request: DebugSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return submit_debug_fix(db, current_user.id, request.challenge_id, request.code)