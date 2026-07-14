from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, problems, execution, submissions, debugging, analytics, admin, rag_chat, agents

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(problems.router)
api_router.include_router(execution.router)
api_router.include_router(submissions.router)
api_router.include_router(debugging.router)
api_router.include_router(analytics.router)
api_router.include_router(admin.router)
api_router.include_router(rag_chat.router)
api_router.include_router(agents.router)