from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class AgentTask(BaseModel):
    __tablename__ = "agent_tasks"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_type = Column(String, nullable=False, default="career_advisor")
    result = Column(JSON, nullable=True)
    reasoning_steps = Column(JSON, nullable=True)

    user = relationship("User")