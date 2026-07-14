import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from openai import OpenAI
from app.core.config import settings
from app.models.career_track import SalaryTier, TierChecklistItem
from app.models.problem import Problem
from app.services.ai.prompt_templates import tier_curation_prompt
from app.services.problem_service import generate_and_save_bulk


client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")

REFRESH_INTERVAL_DAYS = 30


def _needs_refresh(tier: SalaryTier) -> bool:
    if tier.last_curated_at is None:
        return True
    return datetime.utcnow() - tier.last_curated_at > timedelta(days=REFRESH_INTERVAL_DAYS)


def _curate_tier_content(tier_name: str, min_lpa: int, max_lpa) -> dict:
    prompt = tier_curation_prompt(tier_name, min_lpa, max_lpa)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a precise, experienced technical recruiter. Respond only in valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
        max_tokens=900
    )

    raw = response.choices[0].message.content.strip().replace("```json", "").replace("```", "")
    start, end = raw.find("{"), raw.rfind("}")
    return json.loads(raw[start:end + 1])


def ensure_tier_curated(db: Session, tier: SalaryTier) -> SalaryTier:
    """
    Self-updating: regenerates tier curriculum via AI if missing or stale.
    This is the core 'agentic curator' — runs automatically, no manual seeding.
    """
    if not _needs_refresh(tier):
        return tier

    # Mark as "being curated" immediately to reduce race condition window
    # (two users hitting this within milliseconds of each other)
    tier.last_curated_at = datetime.utcnow()
    db.commit()

    try:
        data = _curate_tier_content(tier.name, tier.min_lpa, tier.max_lpa)
    except Exception:
        return tier

    tier.description = data.get("description", tier.description)
    tier.dsa_topics = data.get("dsa_topics", tier.dsa_topics)
    tier.required_subjects = data.get("required_subjects", tier.required_subjects)
    tier.behavioral_focus = data.get("behavioral_focus", tier.behavioral_focus)

    existing_items = db.query(TierChecklistItem).filter(TierChecklistItem.tier_id == tier.id).count()
    if existing_items == 0:
        for item in data.get("checklist_items", []):
            db.add(TierChecklistItem(tier_id=tier.id, item_text=item["item_text"], category=item["category"]))

    db.commit()
    db.refresh(tier)
    return tier


def get_recommended_problems_for_tier(db: Session, tier: SalaryTier, limit: int = 8) -> list:
    """
    Links the tier to REAL problems in the database, matching difficulty to
    the tier's expectations. Auto-generates more via AI if not enough exist yet.
    """
    difficulty_map = {
        "4-8 LPA": ["easy", "medium"],
        "8-15 LPA": ["medium"],
        "15-30 LPA": ["medium", "hard"],
        "30+ LPA": ["hard"],
    }
    target_difficulties = difficulty_map.get(tier.name, ["medium"])
    category_filters = [t.lower().replace(" ", "-") for t in (tier.dsa_topics or [])]

    problems = db.query(Problem).filter(
        Problem.problem_type == "coding",
        Problem.difficulty.in_(target_difficulties)
    ).limit(limit * 3).all()

    scored = []
    for p in problems:
        relevance = sum(1 for cat in category_filters if cat in p.category.lower().replace(" ", "-"))
        scored.append((relevance, p))
    scored.sort(key=lambda x: x[0], reverse=True)
    matched = [p for _, p in scored if _ > 0][:limit]

    # Not enough topic-relevant problems exist yet — generate a few via AI, grounded in this tier's actual topics
    if len(matched) < limit and tier.dsa_topics:
        needed = min(limit - len(matched), 3)  # cap AI calls per request for cost/speed
        primary_difficulty = target_difficulties[0]
        for topic in tier.dsa_topics[:needed]:
            try:
                generate_and_save_bulk(db, topic, primary_difficulty, "coding", 1)
            except Exception:
                continue

        # re-query after generation
        problems = db.query(Problem).filter(
            Problem.problem_type == "coding",
            Problem.difficulty.in_(target_difficulties)
        ).limit(limit * 3).all()
        scored = []
        for p in problems:
            relevance = sum(1 for cat in category_filters if cat in p.category.lower().replace(" ", "-"))
            scored.append((relevance, p))
        scored.sort(key=lambda x: x[0], reverse=True)
        matched = [p for _, p in scored[:limit]]

    return matched if matched else [p for p in problems[:limit]]