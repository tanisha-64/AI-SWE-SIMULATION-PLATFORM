from sqlalchemy.orm import Session
from app.models.success_story import SuccessStory


def submit_story(db: Session, user_id: int, data) -> SuccessStory:
    story = SuccessStory(
        user_id=user_id,
        company_name=data.company_name,
        role=data.role,
        package_lpa=data.package_lpa,
        testimonial=data.testimonial,
        is_approved=False
    )
    db.add(story)
    db.commit()
    db.refresh(story)
    return story


def get_public_stories(db: Session, limit: int = 20):
    return db.query(SuccessStory).filter(
        SuccessStory.is_approved == True,
        SuccessStory.is_public == True
    ).order_by(SuccessStory.created_at.desc()).limit(limit).all()


def approve_story(db: Session, story_id: int) -> dict:
    story = db.query(SuccessStory).filter(SuccessStory.id == story_id).first()
    if story:
        story.is_approved = True
        db.commit()
    return {"message": "Approved", "id": story_id}