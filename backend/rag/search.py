from supabase_client import supabase
from rag.embeddings import embed_text

def search_knowledge_base(question: str, limit: int = 5) -> tuple:
    """
    Cosine similarity search on knowledge_base using Voyage AI embeddings.
    Returns (chunks, top_similarity_score).
    """
    embedding = embed_text(question)

    result = supabase.rpc("match_knowledge_base", {
        "query_embedding": embedding,
        "match_count": limit
    }).execute()

    data = result.data or []
    top_similarity = round(data[0]["similarity"] * 100) if data else 0

    return data, top_similarity
