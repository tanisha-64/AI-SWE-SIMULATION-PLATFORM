from sqlalchemy.orm import Session
from datetime import date, timedelta, datetime
from app.models.analytics import DailyActivity, UserAnalytics


def record_activity(db: Session, user_id: int):
    today = date.today()

    activity = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.activity_date == today
    ).first()

    if not activity:
        activity = DailyActivity(user_id=user_id, activity_date=today, submissions_count=1)
        db.add(activity)
    else:
        activity.submissions_count += 1

    db.commit()

    _update_streak(db, user_id)


def _update_streak(db: Session, user_id: int):
    analytics = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id).first()
    if not analytics:
        analytics = UserAnalytics(
            user_id=user_id,
            current_streak=0,
            longest_streak=0
        )
        db.add(analytics)
        db.commit()
        db.refresh(analytics)

    if analytics.current_streak is None:
        analytics.current_streak = 0
    if analytics.longest_streak is None:
        analytics.longest_streak = 0

    today = date.today()
    yesterday = today - timedelta(days=1)

    last_active = analytics.last_active_date.date() if analytics.last_active_date else None

    if last_active == today:
        pass
    elif last_active == yesterday:
        analytics.current_streak += 1
    else:
        analytics.current_streak = 1

    analytics.longest_streak = max(analytics.longest_streak, analytics.current_streak)
    analytics.last_active_date = datetime.utcnow()

    db.commit()


def get_calendar_heatmap(db: Session, user_id: int, days: int = 90) -> list:
    start_date = date.today() - timedelta(days=days)

    activities = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.activity_date >= start_date
    ).all()

    return [
        {"date": a.activity_date.isoformat(), "submissions_count": a.submissions_count}
        for a in activities
    ]


def get_streak_info(db: Session, user_id: int) -> dict:
    analytics = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id).first()
    if not analytics:
        return {"current_streak": 0, "longest_streak": 0, "last_active_date": None}

    return {
        "current_streak": analytics.current_streak or 0,
        "longest_streak": analytics.longest_streak or 0,
        "last_active_date": analytics.last_active_date.isoformat() if analytics.last_active_date else None
    }