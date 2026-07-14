from openai import OpenAI
from app.core.config import settings
from app.services.rag.retrieval_service import retrieve_context
from app.services.rag.ingestion_service import generate_and_ingest_topic
from app.services.ai.prompt_templates import rag_chat_prompt

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def ask_mentor(question: str) -> dict:
    """
    Full self-expanding RAG pipeline:
    1. Try to retrieve relevant context from the knowledge base
    2. If nothing relevant found, AUTO-GENERATE new knowledge for this question's topic,
       ingest it permanently, then retrieve again
    3. Generate a grounded answer using the retrieved context
    """
    contexts = retrieve_context(question, n_results=3)

    auto_generated = False

    if not contexts:
        try:
            generate_and_ingest_topic(question)
            auto_generated = True
            contexts = retrieve_context(question, n_results=3)
        except ValueError:
            pass

    if not contexts:
        return {
            "answer": "I couldn't find or generate reliable information on this topic right now. Please try rephrasing your question.",
            "sources": [],
            "auto_generated": False
        }

    prompt = rag_chat_prompt(question, contexts)

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a supportive, knowledgeable coding mentor. Answer only from the given reference material."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=300
        )

        answer = response.choices[0].message.content.strip()

        return {
            "answer": answer,
            "sources": [c["topic"] for c in contexts],
            "auto_generated": auto_generated
        }

    except Exception as e:
        return {
            "answer": "I'm having trouble generating a response right now. Please try again in a moment.",
            "sources": [],
            "auto_generated": auto_generated,
            "error": str(e)
        }