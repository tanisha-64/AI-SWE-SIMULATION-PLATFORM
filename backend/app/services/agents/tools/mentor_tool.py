from app.services.rag.rag_chain import ask_mentor


def rag_mentor_tool(question: str) -> str:
    """Tool: Queries the RAG knowledge base for concept explanations."""
    result = ask_mentor(question)
    return result["answer"]