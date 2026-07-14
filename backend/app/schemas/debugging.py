from pydantic import BaseModel
from typing import List, Optional


class DebugChallengeOut(BaseModel):
    id: int
    title: str
    description: str
    broken_code: str
    language: str
    difficulty: str

    class Config:
        from_attributes = True


class HintRequest(BaseModel):
    challenge_id: int
    current_code: str


class HintOut(BaseModel):
    hint_text: str
    hint_level: int
    hints_used_total: int


class DebugSubmitRequest(BaseModel):
    challenge_id: int
    code: str


class DebugSubmitOut(BaseModel):
    status: str
    passed_count: int
    total_count: int
    test_results: List[dict]