from app.services.rag.vector_store import add_documents, get_collection_count
from app.services.rag.embedding_service import get_single_embedding
from app.services.rag.knowledge_generator_service import generate_topic_content


def generate_and_ingest_topic(topic: str) -> dict:
    content = generate_topic_content(topic)
    embedding = get_single_embedding(content, input_type="search_document")

    chunk_id = f"topic_{topic.lower().replace(' ', '_')}"

    add_documents(
        documents=[content],
        ids=[chunk_id],
        embeddings=[embedding],
        metadatas=[{"topic": topic}]
    )

    return {"topic": topic, "content": content}


def bulk_generate_knowledge_base(topics: list) -> dict:
    added = []
    failed = []

    for topic in topics:
        try:
            result = generate_and_ingest_topic(topic)
            added.append(result["topic"])
        except Exception as e:
            print(f"❌ FAILED for topic '{topic}': {type(e).__name__}: {e}")
            failed.append(topic)
            continue

    return {
        "topics_added": added,
        "topics_failed": failed,
        "total_in_db": get_collection_count()
    }


DEFAULT_DSA_TOPICS = [
    "Arrays and their time complexity",
    "Two Pointer Technique",
    "Binary Search",
    "Hash Maps and Hash Sets",
    "Dynamic Programming - Memoization vs Tabulation",
    "Graph Traversal - BFS and DFS",
    "Big-O Time Complexity Analysis",
    "Recursion and the Call Stack",
    "Sliding Window Technique",
    "Linked Lists - Singly and Doubly",
    "Stacks and Queues",
    "Binary Trees and Binary Search Trees",
    "Heaps and Priority Queues",
    "Sorting Algorithms - QuickSort and MergeSort",
    "Greedy Algorithms",
    "Backtracking",
    "Trie Data Structure",
    "Union-Find (Disjoint Set)",
    "System Design Basics - Scalability",
    "Debugging Best Practices",
    "Technical Interview Strategy"
]