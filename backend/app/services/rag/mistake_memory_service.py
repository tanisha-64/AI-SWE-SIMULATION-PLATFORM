import json
from openai import OpenAI
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.chat_session import UserMistakeMemory
from app.services.ai.prompt_templates import extract_mistake_prompt

client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


def record_mistake_from_review(db: Session, user_id: int, code: str, ai_review: dict, problem_title: str):
    """
    Called automatically after an AI code review. Extracts the core conceptual
    mistake (if any) and stores it as a lightweight memory entry — this becomes
    the student's personal 'knowledge gap' history that the mentor can recall later.
    """
    if not ai_review or not ai_review.get("bugs_found"):
        return

    try:
        prompt = extract_mistake_prompt(code, ai_review, problem_title)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Extract mistakes precisely. Respond only in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=150
        )
        raw = response.choices[0].message.content.strip().replace("```json", "").replace("```", "")
        start, end = raw.find("{"), raw.rfind("}")
        data = json.loads(raw[start:end + 1])

        if data.get("concept_tag") and data["concept_tag"].lower() != "none":
            memory = UserMistakeMemory(
                user_id=user_id,
                source_type="submission",
                concept_tag=data["concept_tag"],
                summary=data["summary"],
                problem_title=problem_title
            )
            db.add(memory)
            db.commit()
    except Exception as e:
        print(f"⚠️ Mistake memory extraction failed (non-critical): {e}")


def get_relevant_mistakes(db: Session, user_id: int, question: str, limit: int = 3) -> list:
    """
    Simple keyword-overlap retrieval of the student's past mistakes relevant
    to their current question. Lightweight — no separate vector DB needed,
    since mistake volume per user is naturally small.
    """
    all_mistakes = db.query(UserMistakeMemory).filter(
        UserMistakeMemory.user_id == user_id
    ).order_by(UserMistakeMemory.created_at.desc()).limit(30).all()

    question_words = set(question.lower().split())

    scored = []
    for m in all_mistakes:
        tag_words = set(m.concept_tag.lower().split())
        overlap = len(question_words & tag_words)
        if overlap > 0 or any(w in question.lower() for w in m.concept_tag.lower().split()):
            scored.append((overlap, m))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [m for _, m in scored[:limit]]

    return [
        {"concept_tag": m.concept_tag, "summary": m.summary, "problem_title": m.problem_title or "a past problem"}
        for m in top
    ]