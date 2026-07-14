from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SalaryTier(BaseModel):
    __tablename__ = "salary_tiers"

    name = Column(String, nullable=False, unique=True)
    min_lpa = Column(Integer, nullable=False)
    max_lpa = Column(Integer, nullable=True)
    description = Column(String, nullable=True)

    dsa_topics = Column(JSON, default=list)
    required_subjects = Column(JSON, default=list)
    behavioral_focus = Column(JSON, default=list)

    last_curated_at = Column(DateTime, nullable=True)


class TierChecklistItem(BaseModel):
    __tablename__ = "tier_checklist_items"

    tier_id = Column(Integer, ForeignKey("salary_tiers.id"), nullable=False)
    item_text = Column(String, nullable=False)
    category = Column(String, nullable=False)

    tier = relationship("SalaryTier")


class UserTierProgress(BaseModel):
    __tablename__ = "user_tier_progress"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    checklist_item_id = Column(Integer, ForeignKey("tier_checklist_items.id"), nullable=False)
    is_completed = Column(Boolean, default=False)

    user = relationship("User")
    checklist_item = relationship("TierChecklistItem")