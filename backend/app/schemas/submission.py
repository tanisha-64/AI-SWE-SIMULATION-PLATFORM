from pydantic import BaseModel
from typing import List, Optional


class CodeRunRequest(BaseModel):
    problem_id: int
    code: str
    language: str = "python"


class TestResultOut(BaseModel):
    test_id: int
    passed: bool
    input: str
    expected: str
    actual: str
    error: Optional[str] = None
    is_sample: bool


class SubmissionOut(BaseModel):
    id: int
    problem_id: int
    status: str
    passed_count: int
    total_count: int
    execution_time_ms: Optional[float]
    test_results: List[dict]
    ai_review: Optional[dict] = None

    class Config:
        from_attributes = True

class TraceStep(BaseModel):
    line: int
    variables: dict


class TraceResponse(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    trace: List[TraceStep]