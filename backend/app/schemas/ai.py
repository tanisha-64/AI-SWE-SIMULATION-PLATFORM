from pydantic import BaseModel
from typing import Optional


class CodeReviewOut(BaseModel):
    code_quality_score: Optional[int] = None
    code_quality_note: Optional[str] = None
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    bugs_found: Optional[str] = None
    optimization_suggestions: Optional[str] = None
    overall_verdict: Optional[str] = None