from app.services.rag.vector_store import search_similar
from app.services.rag.embedding_service import get_single_embedding


def retrieve_context(query: str, n_results: int = 3) -> list:
    query_embedding = get_single_embedding(query, input_type="search_query")
    results = search_similar(query_embedding, n_results)

    if not results["documents"] or not results["documents"][0]:
        return []

    contexts = []
    documents = results["documents"][0]
    metadatas = results["metadatas"][0] if results["metadatas"] else [{}] * len(documents)

    for doc, meta in zip(documents, metadatas):
        contexts.append({
            "text": doc,
            "topic": meta.get("topic", "General")
        })

    return contexts