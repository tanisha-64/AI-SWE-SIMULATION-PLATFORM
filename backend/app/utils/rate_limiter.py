from fastapi import HTTPException, status, Depends, Request
from app.core.redis_client import redis_client
from app.utils.jwt_handler import get_current_user
from app.models.user import User


def rate_limit_by_ip(max_requests: int = 5, window_seconds: int = 300):
    """IP-based rate limiting for unauthenticated routes like login/register."""
    def dependency(request: Request):
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit_ip:{client_ip}:{max_requests}:{window_seconds}"

        try:
            current_count = redis_client.incr(key)
            if current_count == 1:
                redis_client.expire(key, window_seconds)
            if current_count > max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many attempts. Please try again later."
                )
        except HTTPException:
            raise
        except Exception:
            pass
        return True

    return dependency