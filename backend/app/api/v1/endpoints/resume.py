from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.resume import ResumeGenerateRequest, ResumeOut
from app.services.resume_service import generate_resume_content, get_resume
from app.utils.jwt_handler import get_current_premium_user, get_current_user
from app.utils.rate_limiter import rate_limit
from app.models.user import User

router = APIRouter(prefix="/resume", tags=["Resume Builder"])


@router.post("/generate", response_model=ResumeOut)
def generate(
    request: ResumeGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_premium_user)
):
    return generate_resume_content(db, current_user.id, request.contact_info, request.education)


@router.get("/", response_model=ResumeOut)
def get_my_resume(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_resume(db, current_user.id)