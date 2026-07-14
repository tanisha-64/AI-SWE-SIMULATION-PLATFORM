from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserRegister, UserLogin, UserOut, Token
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    new_user = register_user(db, user_data)
    return new_user


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    token = login_user(db, login_data)
    return {"access_token": token}