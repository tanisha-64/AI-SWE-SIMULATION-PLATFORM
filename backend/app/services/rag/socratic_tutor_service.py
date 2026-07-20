from openai import OpenAI
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.rag.retrieval_service import retrieve_context
from app.services.rag.ingestion_service import generate_and_ingest_topic
from app.services.ai.prompt_templates import socratic_tutor_prompt, direct_socratic_prompt
from app.models.chat_session import ChatMessage

client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


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
    Multi-turn Socratic tutoring. Tries RAG grounding first; if no reference
    material exists yet, auto-generates it for future use AND still responds
    in proper Socratic style using the model's own DSA/CS knowledge right now.
    """
    history = _get_conversation_history(db, user_id, topic_thread)
    turn_count = len(history)

    contexts = retrieve_context(question, n_results=3)

    if not contexts:
        try:
            generate_and_ingest_topic(question)
            contexts = retrieve_context(question, n_results=3)
        except Exception:
            pass

    try:
        if contexts:
            prompt = socratic_tutor_prompt(question, contexts, history, turn_count)
        else:
            prompt = direct_socratic_prompt(question, history, turn_count)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a patient Socratic tutor who guides students to discover DSA and CS answers themselves through questions, using your own expert knowledge."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=200
        )
        answer = response.choices[0].message.content.strip()
    except Exception:
        answer = "I'm having trouble responding right now. Please try again."

    chat_log = ChatMessage(
        user_id=user_id,
        question=question,
        answer=answer,
        sources=[c["topic"] for c in contexts] if contexts else [],
        topic_thread=topic_thread
    )
    db.add(chat_log)
    db.commit()

    return {
        "answer": answer,
        "sources": [c["topic"] for c in contexts] if contexts else [],
        "turn_count": turn_count + 1
    }