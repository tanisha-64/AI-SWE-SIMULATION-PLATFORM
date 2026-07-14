from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(JSON, default=list)
    topic_thread = Column(String, nullable=True)  # groups messages into a Socratic conversation

    user = relationship("User")