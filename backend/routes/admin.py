from functools import wraps
from flask import Blueprint, request, jsonify
from supabase_client import supabase

admin_bp = Blueprint("admin", __name__)


def require_admin(f):
    """Verifies the request's Authorization header holds a valid Supabase access token."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "").strip()

        if not token:
            return jsonify({"error": "Missing or invalid token."}), 401

        try:
            supabase.auth.get_user(token)
        except Exception:
            return jsonify({"error": "Missing or invalid token."}), 401

        return f(*args, **kwargs)
    return wrapper


@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
    body = request.get_json(silent=True) or {}

    email = (body.get("email") or "").strip()
    password = body.get("password") or ""

    if not email or not password:
        return jsonify({
            "error": "Email and password are required."
        }), 400

    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        return jsonify({
            "message": "Login successful.",
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }), 200

    except Exception:
        return jsonify({
            "error": "Invalid email or password."
        }), 401


@admin_bp.route("/admin/conversations", methods=["GET"])
@require_admin
def admin_conversations():
    result = supabase.table("conversations").select("*").order("created_at", desc=True).execute()
    return jsonify(result.data or [])


@admin_bp.route("/admin/feedback", methods=["GET"])
@require_admin
def admin_feedback():
    result = supabase.table("feedback").select("*").order("created_at", desc=True).execute()
    return jsonify(result.data or [])


@admin_bp.route("/admin/knowledge", methods=["GET"])
@require_admin
def admin_knowledge():
    result = supabase.table("knowledge_base").select(
        "id, question, answer, source_url, category, last_updated"
    ).execute()
    return jsonify(result.data or [])