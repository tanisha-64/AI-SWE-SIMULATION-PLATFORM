from openai import OpenAI
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.rag.retrieval_service import retrieve_context
from app.services.ai.prompt_templates import socratic_tutor_prompt
from app.models.chat_session import ChatMessage

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def _get_conversation_history(db: Session, user_id: int, topic_thread: str) -> list:
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id, ChatMessage.topic_thread == topic_thread)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [{"question": m.question, "answer": m.answer} for m in messages]


def ask_socratic_tutor(db: Session, user_id: int, question: str, topic_thread: str) -> dict:
    """
    Multi-turn Socratic tutoring: guides the student with questions first,
    then explains fully once they've engaged with the thinking process.
    """
    history = _get_conversation_history(db, user_id, topic_thread)
    turn_count = len(history)

    contexts = retrieve_context(question, n_results=3)

    if not contexts:
        return {
            "answer": "I don't have reference material on this topic yet. Try asking about a core DSA concept!",
            "sources": [],
            "turn_count": turn_count
        }

    prompt = socratic_tutor_prompt(question, contexts, history, turn_count)

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a patient Socratic tutor who guides students to discover answers themselves."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=150
        )
        answer = response.choices[0].message.content.strip()
    except Exception as e:
        answer = "I'm having trouble responding right now. Please try again."

    chat_log = ChatMessage(
        user_id=user_id,
        question=question,
        answer=answer,
        sources=[c["topic"] for c in contexts],
        topic_thread=topic_thread
    )
    db.add(chat_log)
    db.commit()

    return {
        "answer": answer,
        "sources": [c["topic"] for c in contexts],
        "turn_count": turn_count + 1
    }