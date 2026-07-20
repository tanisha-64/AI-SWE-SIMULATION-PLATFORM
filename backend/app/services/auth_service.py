import secrets
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
from jose import JWTError
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_access_token
)
from app.services.email_service import send_verification_email


def register_user(db: Session, user_data: UserRegister, background_tasks: BackgroundTasks) -> dict:
    # 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    # 2. Generate secure token
    verification_token = secrets.token_urlsafe(32)

    # 3. Create new user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        is_verified=False,
        verification_token=verification_token
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. SEND EMAIL IN BACKGROUND (Non-blocking)
    background_tasks.add_task(
        send_verification_email,
        new_user.email,
        new_user.full_name,
        verification_token
    )

    # 5. Turant frontend ko success response bhejein
    return {
        "message": "Registration successful! Please check your email to verify your account.",
        "user_id": new_user.id
    }


def verify_email(db: Session, token: str) -> dict:
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid or expired verification link"
        )

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Email verified successfully! You can now log in."}


def resend_verification_email(db: Session, email: str, background_tasks: BackgroundTasks) -> dict:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified")

    # Naya token generate karein
    new_token = secrets.token_urlsafe(32)
    user.verification_token = new_token
    db.commit()

    # Email resend bhi background me hoga
    background_tasks.add_task(
        send_verification_email,
        user.email,
        user.full_name,
        new_token
    )
    
    return {"message": "Verification email resent! Please check your inbox."}


def login_user(db: Session, login_data: UserLogin) -> dict:
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # Security best practice: Same error message for invalid email or password
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Please verify your email before logging in. Check your inbox."
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return {"access_token": access_token, "refresh_token": refresh_token}


def refresh_access_token(refresh_token: str) -> str:
    try:
        payload = decode_access_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token type"
            )
        
        user_id = int(payload.get("sub"))
        return create_access_token(user_id)
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired refresh token"
        )