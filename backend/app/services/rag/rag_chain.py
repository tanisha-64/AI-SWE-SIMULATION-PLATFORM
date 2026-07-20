from openai import OpenAI
from app.core.config import settings
from app.services.rag.retrieval_service import retrieve_context
from app.services.rag.ingestion_service import generate_and_ingest_topic
from app.services.ai.prompt_templates import rag_chat_prompt, direct_dsa_answer_prompt

client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


def ask_mentor(question: str) -> dict:
    """
    Direct-answer mentor mode.
    1. Try to retrieve relevant context from the knowledge base
    2. If found, answer grounded in that context (with citations)
    3. If not found, auto-generate new knowledge base content for future users,
       AND still answer the question directly using the model's own knowledge
       right now — never leaves the user stuck
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

    try:
        if contexts:
            prompt = rag_chat_prompt(question, contexts)
            system_msg = "You are a supportive, knowledgeable coding mentor. Answer using the given reference material."
        else:
            # No RAG context available even after trying to generate it —
            # fall back to the model's own DSA/CS knowledge directly
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
            "auto_generated": auto_generated
        }

    except Exception as e:
        return {
            "answer": "I'm having trouble generating a response right now. Please try again in a moment.",
            "sources": [],
            "auto_generated": auto_generated,
            "error": str(e)
        }