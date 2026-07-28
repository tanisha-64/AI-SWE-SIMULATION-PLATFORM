from pydantic import BaseModel
from typing import List


class PricingPlan(BaseModel):
    id: str
    name: str
    price_inr: int
    billing_period: str
    features: List[str]
    is_current: bool = False
    highlighted: bool = False