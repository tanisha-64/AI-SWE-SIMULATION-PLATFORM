def send_contact_confirmation_email(to_email: str, name: str, subject: str):
    try:
        resend.Emails.send({
            "from": "CodeMentor AI <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "We received your message — CodeMentor AI",
            "html": f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #6366f1;">Thanks, {name}! 🙌</h2>
                <p>We received your message about "<strong>{subject}</strong>" and our team will get back to you soon.</p>
                <p style="color: #888; font-size: 13px;">This is an automated confirmation.</p>
            </div>
            """
        })
    except Exception as e:
        print(f"❌ Contact confirmation email failed: {e}")