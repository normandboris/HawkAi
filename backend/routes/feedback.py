from flask import Blueprint, request, jsonify
from supabase_client import supabase

feedback_bp = Blueprint("feedback", __name__)


@feedback_bp.route("/feedback", methods=["POST"])
def feedback():
    body = request.get_json(silent=True) or {}
    session_id = body.get("session_id")
    question = body.get("question")
    answer = body.get("answer")
    rating = body.get("rating")

    if rating is None or not question or not answer:
        return jsonify({"error": "question, answer, and rating are required"}), 400

    supabase.table("feedback").insert({
        "session_id": session_id,
        "question": question,
        "answer": answer,
        "rating": rating,
    }).execute()

    return jsonify({"status": "feedback saved"})
