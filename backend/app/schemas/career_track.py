from pydantic import BaseModel
from typing import List, Optional


class ChecklistItemOut(BaseModel):
    id: int
    item_text: str
    category: str
    is_completed: bool


class RecommendedProblem(BaseModel):
    id: int
    title: str
    difficulty: str
    category: str


class SalaryTierOut(BaseModel):
    id: int
    name: str
    min_lpa: int
    max_lpa: Optional[int]
    description: Optional[str]
    dsa_topics: List[str]
    required_subjects: List[str]
    behavioral_focus: List[str]

    class Config:
        from_attributes = True


class SalaryTierDetail(BaseModel):
    id: int
    name: str
    min_lpa: int
    max_lpa: Optional[int]
    description: Optional[str]
    dsa_topics: List[str]
    required_subjects: List[str]
    behavioral_focus: List[str]
    checklist: List[ChecklistItemOut]
    recommended_problems: List[RecommendedProblem]


class ToggleChecklistRequest(BaseModel):
    checklist_item_id: int