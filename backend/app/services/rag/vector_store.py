import chromadb

chroma_client = chromadb.PersistentClient(path="app/rag_data/vector_index")

collection = chroma_client.get_or_create_collection(name="dsa_knowledge_base")


def add_documents(documents: list, ids: list, embeddings: list, metadatas: list = None):
    collection.add(
        documents=documents,
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas
    )


def search_similar(query_embedding: list, n_results: int = 3) -> dict:
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results


def get_collection_count() -> int:
    return collection.count()