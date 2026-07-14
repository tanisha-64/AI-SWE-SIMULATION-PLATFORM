from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.career_track import SalaryTierOut, SalaryTierDetail, ToggleChecklistRequest
from app.services.career_track_service import get_all_tiers, get_tier_detail, toggle_checklist_item, get_tier_progress_summary
from app.utils.jwt_handler import get_current_user
from app.models.user import User
from app.utils.rate_limiter import rate_limit


router = APIRouter(prefix="/career-tracks", tags=["Career Tracks"])

@router.get("/", response_model=List[SalaryTierOut])
def list_tiers(db: Session = Depends(get_db), current_user: User = Depends(rate_limit(max_requests=10, window_seconds=60))):
    return get_all_tiers(db)


@router.get("/{tier_id}", response_model=SalaryTierDetail)
def tier_detail(tier_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_tier_detail(db, tier_id, current_user.id)


@router.post("/checklist/toggle")
def toggle_item(request: ToggleChecklistRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return toggle_checklist_item(db, current_user.id, request.checklist_item_id)


@router.get("/{tier_id}/progress")
def tier_progress(tier_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_tier_progress_summary(db, tier_id, current_user.id)