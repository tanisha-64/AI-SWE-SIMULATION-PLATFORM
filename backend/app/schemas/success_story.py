from pydantic import BaseModel
from typing import Optional


class SuccessStoryCreate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    package_lpa: Optional[str] = None
    testimonial: str


class SuccessStoryOut(BaseModel):
    id: int
    company_name: Optional[str]
    role: Optional[str]
    package_lpa: Optional[str]
    testimonial: str

    class Config:
        from_attributes = True