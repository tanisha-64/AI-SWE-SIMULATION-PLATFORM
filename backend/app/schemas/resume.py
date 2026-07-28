from pydantic import BaseModel  # type: ignore[import]
from typing import List, Dict, Any, Optional


class ResumeGenerateRequest(BaseModel):
    contact_info: Dict[str, str]
    education: List[Dict[str, Any]]


class ResumeOut(BaseModel):
    contact_info: Dict[str, Any]
    education: List[Dict[str, Any]]
    ai_generated_summary: Optional[str]
    ai_generated_skills: List[str]
    ai_generated_achievements: List[str]

    class Config:
        from_attributes = True