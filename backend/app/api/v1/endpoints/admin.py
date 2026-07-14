from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.problem import Problem
from app.schemas.user import UserOut
from app.utils.jwt_handler import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(User).all()


@router.delete("/problems/{problem_id}")
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if problem:
        db.delete(problem)
        db.commit()
        return {"message": f"Problem {problem_id} deleted"}
    return {"message": "Problem not found"}


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"message": "User not found"}
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {user_id} active status: {user.is_active}"}