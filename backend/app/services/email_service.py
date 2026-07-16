import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


def _send_email(to_email: str, subject: str, html: str) -> bool:
    """Sends an email via Resend, compatible with both old and new SDK versions."""
    params = {
        "from": "CodeMentor AI <onboarding@resend.dev>",
        "to": [to_email],
        "subject": subject,
        "html": html,
    }
    try:
        if hasattr(resend, "Emails"):
            resend.Emails.send(params)
        else:
            resend.emails.send(params)
        return True
    except Exception as e:
        print(f"❌ EMAIL SEND FAILED: {type(e).__name__}: {e}")
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
    return _send_email(to_email, "Verify your email — CodeMentor AI", html)


def send_contact_confirmation_email(to_email: str, name: str, subject: str) -> bool:
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">Thanks, {name}! 🙌</h2>
        <p>We received your message about "<strong>{subject}</strong>" and our team will get back to you soon.</p>
        <p style="color: #888; font-size: 13px;">This is an automated confirmation.</p>
    </div>
    """
    return _send_email(to_email, "We received your message — CodeMentor AI", html)