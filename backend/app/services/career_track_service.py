from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.career_track import SalaryTier, TierChecklistItem, UserTierProgress
from app.services.career_track_curator_service import ensure_tier_curated, get_recommended_problems_for_tier


def get_all_tiers(db: Session):
    tiers = db.query(SalaryTier).order_by(SalaryTier.min_lpa).all()
    for tier in tiers:
        ensure_tier_curated(db, tier)
    return tiers


def get_tier_detail(db: Session, tier_id: int, user_id: int):
    tier = db.query(SalaryTier).filter(SalaryTier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Salary tier not found")

    tier = ensure_tier_curated(db, tier)

    items = db.query(TierChecklistItem).filter(TierChecklistItem.tier_id == tier_id).all()
    completed_ids = {
        p.checklist_item_id for p in db.query(UserTierProgress).filter(
            UserTierProgress.user_id == user_id,
            UserTierProgress.checklist_item_id.in_([i.id for i in items])
        ).all()
    }

    checklist = [
        {"id": i.id, "item_text": i.item_text, "category": i.category, "is_completed": i.id in completed_ids}
        for i in items
    ]

    recommended = get_recommended_problems_for_tier(db, tier)
    recommended_out = [
        {"id": p.id, "title": p.title, "difficulty": p.difficulty, "category": p.category}
        for p in recommended
    ]

    return {
        "id": tier.id,
        "name": tier.name,
        "min_lpa": tier.min_lpa,
        "max_lpa": tier.max_lpa,
        "description": tier.description,
        "dsa_topics": tier.dsa_topics,
        "required_subjects": tier.required_subjects,
        "behavioral_focus": tier.behavioral_focus,
        "checklist": checklist,
        "recommended_problems": recommended_out
    }


def toggle_checklist_item(db: Session, user_id: int, checklist_item_id: int):
    item = db.query(TierChecklistItem).filter(TierChecklistItem.id == checklist_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    progress = db.query(UserTierProgress).filter(
        UserTierProgress.user_id == user_id,
        UserTierProgress.checklist_item_id == checklist_item_id
    ).first()

    if progress:
        progress.is_completed = not progress.is_completed
    else:
        progress = UserTierProgress(user_id=user_id, checklist_item_id=checklist_item_id, is_completed=True)
        db.add(progress)

    db.commit()
    return {"checklist_item_id": checklist_item_id, "is_completed": progress.is_completed}


def get_tier_progress_summary(db: Session, tier_id: int, user_id: int) -> dict:
    total = db.query(TierChecklistItem).filter(TierChecklistItem.tier_id == tier_id).count()
    completed = db.query(UserTierProgress).join(TierChecklistItem).filter(
        TierChecklistItem.tier_id == tier_id,
        UserTierProgress.user_id == user_id,
        UserTierProgress.is_completed == True
    ).count()
    return {"total": total, "completed": completed, "percentage": round((completed / total * 100) if total else 0, 1)}