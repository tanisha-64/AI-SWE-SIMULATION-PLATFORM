from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.rag import ChatQuery, ChatResponse, BulkGenerateRequest
from app.services.rag.rag_chain import ask_mentor
from app.services.rag.ingestion_service import bulk_generate_knowledge_base, DEFAULT_DSA_TOPICS
from app.models.chat_session import ChatMessage
from app.utils.jwt_handler import get_current_user
from app.utils.rate_limiter import rate_limit
from app.models.user import User
from app.schemas.rag import SocraticQuery, SocraticResponse
from app.services.rag.socratic_tutor_service import ask_socratic_tutor

router = APIRouter(prefix="/chat", tags=["Mentor Chat (RAG)"])


@router.post("/ask", response_model=ChatResponse)
def ask_question(
    query: ChatQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(rate_limit(max_requests=15, window_seconds=60))
):
    result = ask_mentor(query.question)

    chat_log = ChatMessage(
        user_id=current_user.id,
        question=query.question,
        answer=result["answer"],
        sources=result["sources"]
    )
    db.add(chat_log)
    db.commit()

    return result


@router.post("/build-knowledge-base")
def build_knowledge_base(
    request: BulkGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Auto-generates the entire knowledge base using AI.
    Pass custom topics, or leave empty to use the default DSA curriculum.
    """
    topics = request.topics if request.topics else DEFAULT_DSA_TOPICS
    return bulk_generate_knowledge_base(topics)


@router.post("/socratic", response_model=SocraticResponse)
def ask_socratic(
    query: SocraticQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(rate_limit(max_requests=15, window_seconds=60))
):
    return ask_socratic_tutor(db, current_user.id, query.question, query.topic_thread)