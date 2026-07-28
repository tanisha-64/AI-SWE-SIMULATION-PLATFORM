from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.success_story import SuccessStoryCreate, SuccessStoryOut
from app.services.success_story_service import submit_story, get_public_stories, approve_story
from app.utils.jwt_handler import get_current_user, get_current_admin
from app.models.user import User

router = APIRouter(prefix="/success-stories", tags=["Success Stories"])


@router.post("/", response_model=SuccessStoryOut)
def create_story(data: SuccessStoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return submit_story(db, current_user.id, data)


@router.get("/", response_model=List[SuccessStoryOut])
def list_public_stories(db: Session = Depends(get_db)):
    return get_public_stories(db)


@router.patch("/admin/{story_id}/approve")
def approve(story_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return approve_story(db, story_id)