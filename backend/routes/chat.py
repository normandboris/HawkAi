from flask import Blueprint, request, jsonify
from rag.search import search_knowledge_base
from rag.prompt import generate_answer
from supabase_client import supabase
import uuid

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    body = request.get_json(silent=True) or {}
    question = (body.get("question") or "").strip()
    session_id = body.get("session_id") or str(uuid.uuid4())

    if not question:
        return jsonify({"error": "question is required"}), 400

    # Step 1 — cosine similarity search
    chunks, confidence = search_knowledge_base(question)

    # Step 2 — generate answer
    answer = generate_answer(question, chunks)

    # Step 3 — save both turns to conversations
    supabase.table("conversations").insert([
        {"session_id": session_id, "role": "user", "message": question},
        {"session_id": session_id, "role": "assistant", "message": answer, "confidence": confidence},
    ]).execute()

    return jsonify({"answer": answer, "session_id": session_id, "confidence": confidence})
