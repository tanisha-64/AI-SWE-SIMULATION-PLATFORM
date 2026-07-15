from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.contact import ContactMessageCreate, ContactMessageOut
from app.services.contact_service import create_contact_message, get_all_contact_messages, update_contact_status
from app.utils.jwt_handler import get_current_user, get_current_admin
from app.utils.rate_limiter import rate_limit
from app.models.user import User

router = APIRouter(prefix="/contact", tags=["Contact & Help"])


@router.post("/", response_model=ContactMessageOut)
def submit_contact(
    data: ContactMessageCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(rate_limit(max_requests=5, window_seconds=300))
):
    return create_contact_message(db, current_user.id, data)


@router.get("/admin/all", response_model=List[ContactMessageOut])
def list_all_messages(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return get_all_contact_messages(db)


@router.patch("/admin/{message_id}/status")
def set_status(message_id: int, status: str, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return update_contact_status(db, message_id, status)