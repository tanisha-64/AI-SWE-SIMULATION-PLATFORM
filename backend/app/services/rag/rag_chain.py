from openai import OpenAI  # type: ignore[import]
from sqlalchemy.orm import Session  # type: ignore[import]
from app.core.config import settings
from app.services.rag.retrieval_service import retrieve_context
from app.services.rag.ingestion_service import generate_and_ingest_topic
from app.services.rag.mistake_memory_service import get_relevant_mistakes
from app.services.ai.prompt_templates import personal_memory_rag_prompt, direct_dsa_answer_prompt

client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


def ask_mentor(db: Session, user_id: int, question: str) -> dict:
    """
    Personal Memory RAG pipeline:
    1. Retrieve relevant context from the general knowledge base
    2. If nothing found, auto-generate new knowledge for this topic
    3. Retrieve this student's relevant past mistakes (personal memory)
    4. Answer using general knowledge + personal history, or fall back to
       the model's own DSA/CS knowledge if neither source has anything
    """
    contexts = retrieve_context(question, n_results=3)
    auto_generated = False

    if not contexts:
        try:
            generate_and_ingest_topic(question)
            auto_generated = True
            contexts = retrieve_context(question, n_results=3)
        except Exception:
            pass

    personal_mistakes = get_relevant_mistakes(db, user_id, question)

    try:
        if contexts or personal_mistakes:
            prompt = personal_memory_rag_prompt(question, contexts, personal_mistakes)
            system_msg = "You are a personalized coding mentor who remembers this student's history. Answer only from the given reference material and personal context."
        else:
            prompt = direct_dsa_answer_prompt(question)
            system_msg = "You are an expert coding interview mentor with deep knowledge of data structures, algorithms, and computer science fundamentals."

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=400
        )
        answer = response.choices[0].message.content.strip()

        return {
            "answer": answer,
            "sources": [c["topic"] for c in contexts] if contexts else [],
            "personal_context_used": len(personal_mistakes) > 0,
            "auto_generated": auto_generated
        }

    except Exception as e:
        return {
            "answer": "I'm having trouble generating a response right now. Please try again in a moment.",
            "sources": [],
            "personal_context_used": False,
            "auto_generated": auto_generated,
            "error": str(e)
        }