#!/usr/bin/env python3
"""
Password Strengthening System - Flask Alternative Backend
Author: A0nup
"""

import os
from flask import Flask, request, jsonify, send_from_directory
from app import check_password_strength, generate_secure_password

app = Flask(__name__, static_folder=".", static_url_path="")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def static_proxy(path):
    if os.path.exists(path):
        return send_from_directory(".", path)
    return send_from_directory(".", "index.html")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "app": "Password Strengthening System",
        "developer": "A0nup",
        "version": "1.0.0"
    })


@app.route("/api/check-password", methods=["POST"])
def api_check_password():
    data = request.get_json(silent=True) or {}
    password = data.get("password", "")
    return jsonify(check_password_strength(password))


@app.route("/api/generate-password", methods=["POST"])
def api_generate_password():
    data = request.get_json(silent=True) or {}
    length = int(data.get("length", 16))
    upper = bool(data.get("uppercase", True))
    lower = bool(data.get("lowercase", True))
    numbers = bool(data.get("numbers", True))
    symbols = bool(data.get("symbols", True))

    password = generate_secure_password(length, upper, lower, numbers, symbols)
    strength = check_password_strength(password)
    return jsonify({
        "password": password,
        "length": len(password),
        "strength": strength
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
