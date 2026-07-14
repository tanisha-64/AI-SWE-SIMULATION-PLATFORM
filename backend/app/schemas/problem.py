from pydantic import BaseModel, field_validator
from typing import List, Optional

class TestCase(BaseModel):
    input: str
    output: str
    is_sample: bool = False

    @field_validator("input", "output", mode="before")
    @classmethod
    def convert_to_string(cls, value):
        if isinstance(value, bool):
            return str(value).lower()  # True -> "true", False -> "false"
        if not isinstance(value, str):
            return str(value)
        return value


class ProblemCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    category: str
    problem_type: str = "coding"  # coding, mcq, project
    company_style_tag: Optional[str] = None

    test_cases: Optional[List[TestCase]] = None
    time_limit_seconds: int = 5

    mcq_options: Optional[List[str]] = None
    mcq_correct_index: Optional[int] = None
    mcq_explanation: Optional[str] = None

    project_requirements: Optional[List[str]] = None
    project_evaluation_criteria: Optional[str] = None


class ProblemOut(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    category: str
    problem_type: str
    company_style_tag: Optional[str] = None

    class Config:
        from_attributes = True


class ProblemDetail(ProblemOut):
    test_cases: Optional[List[TestCase]] = None
    time_limit_seconds: Optional[int] = None
    mcq_options: Optional[List[str]] = None
    project_requirements: Optional[List[str]] = None
    project_evaluation_criteria: Optional[str] = None


class GenerateProblemRequest(BaseModel):
    category: str
    difficulty: str
    problem_type: str = "coding"  # coding, mcq, project
    count: int = 1


class MCQSubmitRequest(BaseModel):
    problem_id: int
    selected_index: int


class MCQSubmitOut(BaseModel):
    is_correct: bool
    correct_index: int
    explanation: Optional[str] = None