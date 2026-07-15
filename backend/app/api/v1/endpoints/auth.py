from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import (
    UserRegister, UserLogin, Token, RegisterResponse,
    VerifyEmailRequest, MessageResponse, ResendVerificationRequest, RefreshRequest
)
from app.services.auth_service import (
    register_user, login_user, verify_email, resend_verification_email, refresh_access_token
)
from app.utils.rate_limiter import rate_limit_by_ip

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    return register_user(db, user_data)


@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
    _: bool = Depends(rate_limit_by_ip(max_requests=5, window_seconds=300))
):
    return login_user(db, login_data)


@router.post("/refresh")
def refresh(request: RefreshRequest):
    new_access_token = refresh_access_token(request.refresh_token)
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/verify-email", response_model=MessageResponse)
def verify(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    return verify_email(db, request.token)


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    return resend_verification_email(db, request.email)