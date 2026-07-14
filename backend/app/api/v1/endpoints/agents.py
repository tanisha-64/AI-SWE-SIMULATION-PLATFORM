from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.agent import AgentRunResponse
from app.services.agents.career_advisor_agent import career_advisor_agent
from app.models.agent_task import AgentTask
from app.utils.jwt_handler import get_current_premium_user
from app.models.user import User

router = APIRouter(prefix="/agents", tags=["Agentic AI"])


@router.post("/career-advisor", response_model=AgentRunResponse)
def run_career_advisor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_premium_user)
):
    """
    Runs the autonomous Career Advisor Agent — analyzes performance,
    finds weak areas, recommends problems, fetches relevant concepts,
    and generates a personalized action plan. Takes several seconds
    as it performs multiple reasoning steps.

    Premium-only feature.
    """
    result = career_advisor_agent.run(db, current_user.id)

    task_log = AgentTask(
        user_id=current_user.id,
        agent_type="career_advisor",
        result={"action_plan": result["action_plan"]},
        reasoning_steps=result["reasoning_steps"]
    )
    db.add(task_log)
    db.commit()

    return result