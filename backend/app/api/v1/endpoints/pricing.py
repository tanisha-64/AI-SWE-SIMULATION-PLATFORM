from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.pricing import PricingPlan
from app.utils.jwt_handler import get_current_user
from app.models.user import User

router = APIRouter(prefix="/pricing", tags=["Pricing"])

PLANS = [
    {
        "id": "free",
        "name": "Free",
        "price_inr": 0,
        "billing_period": "forever",
        "features": [
            "Daily MCQ & Debug Challenges",
            "AI-generated coding problems (unlimited)",
            "Sandboxed code execution + Trace Visualizer",
            "1 AI Mentor question per day",
            "Basic analytics & streak tracking",
        ],
        "highlighted": False,
    },
    {
        "id": "premium",
        "name": "Premium",
        "price_inr": 299,
        "billing_period": "month",
        "features": [
            "Everything in Free",
            "Unlimited AI Mentor access (Direct + Socratic modes)",
            "Autonomous AI Career Advisor Agent",
            "AI Resume Builder with PDF export",
            "Personalized Salary-Tier Career Tracks",
            "Priority AI problem generation",
            "Full analytics + Industry Readiness breakdown",
        ],
        "highlighted": True,
    },
]


@router.get("/plans", response_model=List[PricingPlan])
def get_plans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {**plan, "is_current": (plan["id"] == "premium") == current_user.is_premium}
        for plan in PLANS
    ]