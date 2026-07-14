from sqlalchemy import Column, String, Text, JSON, Integer
from app.models.base import BaseModel


class Problem(BaseModel):
    __tablename__ = "problems"

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False)  # easy, medium, hard
    category = Column(String, nullable=False)     # arrays, strings, dp, system-design, etc.
    problem_type = Column(String, nullable=False, default="coding")  # coding, mcq, project
    company_style_tag = Column(String, nullable=True)  # e.g. "Fintech/Payments style (Razorpay, Stripe pattern)"

    # Coding-type fields
    test_cases = Column(JSON, nullable=True)
    time_limit_seconds = Column(Integer, default=5)

    # MCQ-type fields
    mcq_options = Column(JSON, nullable=True)       # ["option A", "option B", ...]
    mcq_correct_index = Column(Integer, nullable=True)
    mcq_explanation = Column(Text, nullable=True)

    # Project-type fields
    project_requirements = Column(JSON, nullable=True)  # ["req 1", "req 2", ...]
    project_evaluation_criteria = Column(Text, nullable=True)

    is_active = Column(String, default="true")