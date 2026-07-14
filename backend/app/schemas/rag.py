from pydantic import BaseModel
from typing import List, Optional


class ChatQuery(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    auto_generated: bool = False


class SocraticQuery(BaseModel):
    question: str
    topic_thread: str  # e.g. "binary-search-2026-07-12" — frontend generates/manages this


class SocraticResponse(BaseModel):
    answer: str
    sources: List[str]
    turn_count: int


class BulkGenerateRequest(BaseModel):
    topics: Optional[List[str]] = None