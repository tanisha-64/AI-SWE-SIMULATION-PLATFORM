from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean  # type: ignore[import]
from sqlalchemy.orm import relationship  # type: ignore[import]
from app.models.base import BaseModel


class SuccessStory(BaseModel):
    __tablename__ = "success_stories"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=True)
    role = Column(String, nullable=True)
    package_lpa = Column(String, nullable=True)
    testimonial = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)  # admin moderation before public display
    is_public = Column(Boolean, default=True)

    user = relationship("User")