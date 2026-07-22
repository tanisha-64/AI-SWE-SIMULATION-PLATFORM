from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(JSON, default=list)
    topic_thread = Column(String, nullable=True)

    user = relationship("User")


class UserMistakeMemory(BaseModel):
    __tablename__ = "user_mistake_memory"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source_type = Column(String, nullable=False)  # "submission" or "debug_challenge"
    concept_tag = Column(String, nullable=False)  # e.g. "off-by-one", "recursion base case"
    summary = Column(Text, nullable=False)         # short description of the mistake
    problem_title = Column(String, nullable=True)

    user = relationship("User")