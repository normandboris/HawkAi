from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.chat import chat_bp
from routes.feedback import feedback_bp
from routes.admin import admin_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(chat_bp)
app.register_blueprint(feedback_bp)
app.register_blueprint(admin_bp)


@app.route("/health")
def health():
    return jsonify({"status": "HawkAI is running"})


if __name__ == "__main__":
    app.run(debug=True)