import cohere
from typing import List
from app.core.config import settings

co = cohere.Client(settings.COHERE_API_KEY)


def get_embeddings(texts: List[str], input_type: str = "search_document") -> List[List[float]]:
    """
    Uses Cohere's free embedding API — no local download, highly reliable.
    input_type: "search_document" for stored content, "search_query" for user questions.
    """
    response = co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type=input_type
    )
    return response.embeddings


def get_single_embedding(text: str, input_type: str = "search_document") -> List[float]:
    result = get_embeddings([text], input_type)
    return result[0]