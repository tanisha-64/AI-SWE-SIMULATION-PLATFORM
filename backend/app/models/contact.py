from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ContactMessage(BaseModel):
    __tablename__ = "contact_messages"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable: allow non-logged-in help too
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    category = Column(String, nullable=False)  # "bug", "feature_request", "help", "feedback"
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="open")  # "open", "in_progress", "resolved"

    user = relationship("User")