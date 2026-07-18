from flask import Blueprint, request, jsonify
from supabase_client import supabase

admin_bp = Blueprint("admin", __name__)


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