from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Submission(BaseModel):
    __tablename__ = "submissions"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String, nullable=False, default="python")
    status = Column(String, nullable=False, default="pending")
    test_results = Column(JSON, nullable=True)
    passed_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    execution_time_ms = Column(Float, nullable=True)
    ai_review = Column(JSON, nullable=True)

    user = relationship("User")
    problem = relationship("Problem")

class McqAttempt(BaseModel):
    __tablename__ = "mcq_attempts"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    selected_index = Column(Integer, nullable=False)
    is_correct = Column(String, nullable=False)

    user = relationship("User")
    problem = relationship("Problem")