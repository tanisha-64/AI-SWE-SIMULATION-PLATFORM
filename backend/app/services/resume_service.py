import json
from openai import OpenAI
from sqlalchemy.orm import Session  # type: ignore
from fastapi import HTTPException
from app.core.config import settings
from app.models.resume import Resume
from app.services.analytics_service import get_user_analytics
from app.services.badge_service import get_user_badges
from app.services.ai.prompt_templates import resume_content_prompt

client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


def generate_resume_content(db: Session, user_id: int, contact_info: dict, education: list) -> Resume:
    analytics = get_user_analytics(db, user_id)
    badges = get_user_badges(db, user_id)

    analytics_dict = {
        "total_problems_solved": analytics.total_problems_solved,
        "accuracy_percentage": analytics.accuracy_percentage,
        "industry_readiness_score": analytics.industry_readiness_score,
        "strengths": analytics.strengths,
        "debugging_challenges_solved": analytics.debugging_challenges_solved,
        "avg_code_quality_score": analytics.avg_code_quality_score,
    }

    prompt = resume_content_prompt(analytics_dict, badges, education)

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a precise, honest resume writer. Respond only in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=600
        )
        raw = response.choices[0].message.content.strip().replace("```json", "").replace("```", "")
        start, end = raw.find("{"), raw.rfind("}")
        data = json.loads(raw[start:end + 1])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Resume generation failed: {e}")

    resume = db.query(Resume).filter(Resume.user_id == user_id).first()
    if not resume:
        resume = Resume(user_id=user_id)
        db.add(resume)

    resume.contact_info = contact_info
    resume.education = education
    resume.ai_generated_summary = data.get("summary", "")
    resume.ai_generated_skills = data.get("skills", [])
    resume.ai_generated_achievements = data.get("achievements", [])

    db.commit()
    db.refresh(resume)
    return resume


def get_resume(db: Session, user_id: int) -> Resume:
    resume = db.query(Resume).filter(Resume.user_id == user_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume generated yet")
    return resume