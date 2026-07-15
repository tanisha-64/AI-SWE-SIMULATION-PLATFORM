from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON, Date
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class DebuggingChallenge(BaseModel):
    __tablename__ = "debugging_challenges"

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    broken_code = Column(Text, nullable=False)
    language = Column(String, nullable=False, default="python")
    difficulty = Column(String, nullable=False)
    test_cases = Column(JSON, nullable=False)
    bug_explanation = Column(Text, nullable=False)  # hidden from student, used for AI context
    daily_challenge_date = Column(Date, nullable=True)



class DebuggingAttempt(BaseModel):
    __tablename__ = "debugging_attempts"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("debugging_challenges.id"), nullable=False)
    current_code = Column(Text, nullable=False)
    status = Column(String, default="in_progress")  # in_progress, solved
    hints_used = Column(Integer, default=0)
    hint_history = Column(JSON, default=list)

    user = relationship("User")
    challenge = relationship("DebuggingChallenge")