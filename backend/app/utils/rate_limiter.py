from fastapi import HTTPException, status, Depends
from app.core.redis_client import redis_client
from app.utils.jwt_handler import get_current_user
from app.models.user import User


def rate_limit(max_requests: int = 10, window_seconds: int = 60):
    def dependency(current_user: User = Depends(get_current_user)):
        key = f"rate_limit:{current_user.id}:{max_requests}:{window_seconds}"

        try:
            current_count = redis_client.incr(key)
            if current_count == 1:
                redis_client.expire(key, window_seconds)

            if current_count > max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Max {max_requests} requests per {window_seconds} seconds."
                )
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ REDIS ERROR: {type(e).__name__}: {e}")

        return current_user

    return dependency