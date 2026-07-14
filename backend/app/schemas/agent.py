from pydantic import BaseModel
from typing import List, Dict, Any


class AgentRunResponse(BaseModel):
    action_plan: str
    analytics_snapshot: Dict[str, Any]
    recommended_problems: List[Dict[str, Any]]
    reasoning_steps: List[Dict[str, str]]