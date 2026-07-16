import json
from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from openai import OpenAI
from app.core.config import settings
from app.models.debugging_challenge import DebuggingChallenge, DebuggingAttempt
from app.services.code_execution_service import code_executor
from app.services.ai.debugging_hint_service import get_debugging_hint
from app.services.ai.prompt_templates import bug_injection_prompt
from app.services.analytics_service import recalculate_user_analytics
from app.services.streak_service import record_activity

client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


def get_all_challenges(db: Session, difficulty: str = None):
    query = db.query(DebuggingChallenge)
    if difficulty and difficulty.lower() != "all":
        query = query.filter(DebuggingChallenge.difficulty == difficulty.lower())
    return query.all()


def get_challenge_by_id(db: Session, challenge_id: int) -> DebuggingChallenge:
    challenge = db.query(DebuggingChallenge).filter(DebuggingChallenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Debugging challenge not found")
    return challenge


def _get_or_create_attempt(db: Session, user_id: int, challenge_id: int) -> DebuggingAttempt:
    attempt = db.query(DebuggingAttempt).filter(
        DebuggingAttempt.user_id == user_id,
        DebuggingAttempt.challenge_id == challenge_id
    ).first()

    if not attempt:
        challenge = get_challenge_by_id(db, challenge_id)
        attempt = DebuggingAttempt(
            user_id=user_id,
            challenge_id=challenge_id,
            current_code=challenge.broken_code,
            hints_used=0,
            hint_history=[]
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

    return attempt


def request_hint(db: Session, user_id: int, challenge_id: int, current_code: str) -> dict:
    challenge = get_challenge_by_id(db, challenge_id)
    attempt = _get_or_create_attempt(db, user_id, challenge_id)

    attempt.hints_used += 1
    next_hint_level = min(attempt.hints_used, 3)

    hint = get_debugging_hint(
        problem_description=challenge.description,
        bug_explanation=challenge.bug_explanation,
        user_attempt=current_code,
        hint_level=next_hint_level
    )

    attempt.current_code = current_code
    attempt.hint_history = attempt.hint_history + [hint]
    db.commit()

    return {
        "hint_text": hint["hint_text"],
        "hint_level": hint["hint_level"],
        "hints_used_total": attempt.hints_used
    }


def submit_debug_fix(db: Session, user_id: int, challenge_id: int, code: str) -> dict:
    challenge = get_challenge_by_id(db, challenge_id)
    attempt = _get_or_create_attempt(db, user_id, challenge_id)

    execution_result = code_executor.run_test_cases(
        code=code,
        language=challenge.language,
        test_cases=challenge.test_cases
    )

    passed_count = execution_result["passed_count"]
    total_count = execution_result["total_count"]

    attempt.current_code = code
    attempt.status = "solved" if passed_count == total_count else "in_progress"
    db.commit()
    record_activity(db, user_id)
    recalculate_user_analytics(db, user_id)

    return {
        "status": attempt.status,
        "passed_count": passed_count,
        "total_count": total_count,
        "test_results": execution_result["results"]
    }


def _generate_debug_challenge(topic: str, difficulty: str) -> dict:
    """Uses AI to write a short correct function AND intentionally inject one realistic bug into it."""
    prompt = bug_injection_prompt(topic, difficulty)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a precise exercise creator. Respond only in valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.6,
        max_tokens=700
    )

    raw = response.choices[0].message.content.strip().replace("```json", "").replace("```", "")
    start, end = raw.find("{"), raw.rfind("}")
    return json.loads(raw[start:end + 1])


def get_daily_debug_challenges(db: Session, user_id: int) -> list:
    """Auto-generates 6 mixed-difficulty debugging challenges per day, reused by all users all day."""
    today = date.today()

    todays_challenges = db.query(DebuggingChallenge).filter(
        DebuggingChallenge.daily_challenge_date == today
    ).all()

    if len(todays_challenges) < 6:
        difficulty_plan = ["easy", "easy", "medium", "medium", "hard", "hard"]
        topics = ["Array Logic", "Loop Conditions", "String Manipulation", "Recursion", "Dictionary Usage", "Sorting Logic"]
        
        attempts = 0
        # 🌟 FIXED LOOP & INDENTATION STRUCTURE
        while len(todays_challenges) < 6 and attempts < 12:
            idx = len(todays_challenges)
            attempts += 1
            try:
                data = _generate_debug_challenge(
                    topics[idx % len(topics)],
                    difficulty_plan[idx % len(difficulty_plan)]
                )
                
                new_challenge = DebuggingChallenge(
                    title=data.get("title", "Debugging Challenge"),
                    description=data.get("description", "Fix the bug in the code below."),
                    broken_code=data.get("broken_code", ""),
                    language="python",
                    difficulty=difficulty_plan[idx % len(difficulty_plan)],
                    test_cases=data.get("test_cases", []),
                    bug_explanation=data.get("bug_explanation", ""),
                    daily_challenge_date=today
                )
                db.add(new_challenge)
                db.flush() 
                todays_challenges.append(new_challenge)
            except Exception as e:
                print(f"❌ Daily debug challenge generation failed: {e}")
                import time
                time.sleep(0.5)
                continue
        db.commit()

    return todays_challenges