import requests
from app.core.config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def _send_email(to_email: str, to_name: str, subject: str, html: str) -> bool:
    """Sends an email via Brevo's REST API. Never raises — always returns True/False."""
    if not settings.BREVO_API_KEY:
        print("❌ EMAIL SEND SKIPPED: BREVO_API_KEY is not configured")
        return False

    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }
    payload = {
        "sender": {"name": "CodeMentor AI", "email": settings.BREVO_SENDER_EMAIL},
        "to": [{"email": to_email, "name": to_name or to_email}],
        "subject": subject,
        "htmlContent": html,
    }

    try:
        response = requests.post(BREVO_API_URL, json=payload, headers=headers, timeout=15)
        if response.status_code >= 400:
            print(f"❌ EMAIL SEND FAILED: {response.status_code} - {response.text}")
            return False
        return True
    except Exception as e:
        print(f"❌ EMAIL SEND EXCEPTION: {type(e).__name__}: {e}")
        return False


def send_verification_email(to_email: str, full_name: str, token: str) -> bool:
    verify_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">Welcome to CodeMentor AI, {full_name}! 🚀</h2>
        <p>Please verify your email address to activate your account and start practicing.</p>
        <a href="{verify_link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Verify Email
        </a>
        <p style="color: #888; font-size: 13px;">If you didn't create this account, you can safely ignore this email.</p>
    </div>
    """
    return _send_email(to_email, full_name, "Verify your email — CodeMentor AI", html)


def send_contact_confirmation_email(to_email: str, name: str, subject: str) -> bool:
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">Thanks, {name}! 🙌</h2>
        <p>We received your message about "<strong>{subject}</strong>" and our team will get back to you soon.</p>
        <p style="color: #888; font-size: 13px;">This is an automated confirmation.</p>
    </div>
    """
    return _send_email(to_email, name, "We received your message — CodeMentor AI", html)