from pydantic import BaseModel, EmailStr
from typing import Optional


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    category: str
    subject: str
    message: str


class ContactMessageOut(BaseModel):
    id: int
    name: str
    email: str
    category: str
    subject: str
    message: str
    status: str
    created_at: str

    class Config:
        from_attributes = True