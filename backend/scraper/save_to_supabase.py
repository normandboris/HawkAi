
import json
import sys
import os
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from supabase_client import supabase
from rag.embeddings import embed_batch

INPUT_FILE = "campus_data.json"
BATCH_SIZE = 50  # Voyage AI allows up to 128 per call


def load_chunks(path: str) -> list:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_to_supabase(chunks: list):
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        texts = [c.get("text", "") for c in batch]

        print(f"  Embedding batch {i+1}–{i+len(batch)}...")
        embeddings = embed_batch(texts)

        rows = []
        for chunk, embedding in zip(batch, embeddings):
            rows.append({
                "answer": chunk.get("text", ""),
                "question": chunk.get("page_title", ""),
                "source_url": chunk.get("source_url", ""),
                "category": chunk.get("scrape_type", "general"),
                "embedding": embedding,
            })

        supabase.table("knowledge_base").insert(rows).execute()
        print(f"  Inserted {len(rows)} rows.")
        time.sleep(0.5)  # polite delay between batches


if __name__ == "__main__":
    print(f"Loading {INPUT_FILE}...")
    chunks = load_chunks(INPUT_FILE)
    print(f"Loaded {len(chunks)} chunks. Embedding and saving to Supabase...")
    save_to_supabase(chunks)
    print("Done! knowledge_base is populated with embeddings.")
