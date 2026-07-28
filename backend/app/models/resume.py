from sqlalchemy import Column, Integer, Text, ForeignKey, JSON  # type: ignore[import]
from sqlalchemy.orm import relationship  # type: ignore[import]
from app.models.base import BaseModel


class Resume(BaseModel):
    __tablename__ = "resumes"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_info = Column(JSON, default=dict)      # {phone, linkedin, github, location}
    education = Column(JSON, default=list)          # [{degree, institution, year, cgpa}]
    ai_generated_summary = Column(Text, nullable=True)
    ai_generated_skills = Column(JSON, default=list)
    ai_generated_achievements = Column(JSON, default=list)

    user = relationship("User")