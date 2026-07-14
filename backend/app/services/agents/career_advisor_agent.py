from openai import OpenAI
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.agents.base_agent import BaseAgent
from app.services.agents.tools.analytics_tool import get_user_analytics_tool
from app.services.agents.tools.recommendation_tool import recommend_problems_tool
from app.services.agents.tools.mentor_tool import rag_mentor_tool
from app.services.ai.prompt_templates import career_advisor_agent_prompt

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


class CareerAdvisorAgent(BaseAgent):
    """
    Autonomous agent that builds a personalized placement-readiness action plan.

    Reasoning steps (executed in sequence, each step's output informs the next):
    1. OBSERVE: Fetch the student's current analytics (strengths/weaknesses)
    2. ACT: Use weaknesses to fetch targeted problem recommendations
    3. ACT: Use RAG to fetch a concept explanation for the primary weak area
    4. SYNTHESIZE: Combine everything into a single personalized action plan via LLM
    """

    def run(self, db: Session, user_id: int) -> dict:
        steps_log = []

        # Step 1: OBSERVE — get current state
        analytics = get_user_analytics_tool(db, user_id)
        steps_log.append({"step": "observe_analytics", "result": "Fetched performance data"})

        # Step 2: ACT — get targeted recommendations based on weaknesses
        recommendations = recommend_problems_tool(db, user_id, limit=3)
        steps_log.append({"step": "recommend_problems", "result": f"Found {len(recommendations)} problems"})

        # Step 3: ACT — decide what concept to explain based on weaknesses found
        if analytics["weaknesses"]:
            primary_weakness = analytics["weaknesses"][0]
            concept_question = f"Explain {primary_weakness} for someone preparing for coding interviews"
        else:
            concept_question = "What is a good strategy for technical interview preparation?"

        concept_explanation = rag_mentor_tool(concept_question)
        steps_log.append({"step": "fetch_concept_explanation", "result": f"Retrieved explanation for: {concept_question}"})

        # Step 4: SYNTHESIZE — combine everything into final personalized advice
        prompt = career_advisor_agent_prompt(analytics, recommendations, concept_explanation)

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a warm, expert career advisor for coding students."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=400
            )
            action_plan = response.choices[0].message.content.strip()
        except Exception as e:
            action_plan = f"Unable to generate full action plan right now: {str(e)}"

        steps_log.append({"step": "synthesize_action_plan", "result": "Generated final personalized plan"})

        return {
            "action_plan": action_plan,
            "analytics_snapshot": analytics,
            "recommended_problems": recommendations,
            "reasoning_steps": steps_log
        }


career_advisor_agent = CareerAdvisorAgent()