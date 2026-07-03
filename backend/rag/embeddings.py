import voyageai
import os

_client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))

def embed_text(text: str) -> list:
    """Returns a 1024-dimension embedding vector for the given text."""
    result = _client.embed([text], model="voyage-3-lite")
    return result.embeddings[0]

def embed_batch(texts: list) -> list:
    """Returns embeddings for a list of texts. Max 128 per batch."""
    result = _client.embed(texts, model="voyage-3-lite")
    return result.embeddings
