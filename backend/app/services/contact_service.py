from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.contact import ContactMessage
from app.services.email_service import send_contact_confirmation_email

VALID_CATEGORIES = {"bug", "feature_request", "help", "feedback"}


def create_contact_message(db: Session, user_id: int, data) -> ContactMessage:
    if data.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {', '.join(VALID_CATEGORIES)}")

    msg = ContactMessage(
        user_id=user_id,
        name=data.name,
        email=data.email,
        category=data.category,
        subject=data.subject,
        message=data.message,
        status="open"
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    send_contact_confirmation_email(data.email, data.name, data.subject)

    return msg


def get_all_contact_messages(db: Session):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


def update_contact_status(db: Session, message_id: int, status: str) -> dict:
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.status = status
    db.commit()
    return {"message": "Status updated", "id": message_id, "status": status}