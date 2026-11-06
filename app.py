#!/usr/bin/env python3
"""
Password Strengthening System - Backend Server
Author: A0nup

Zero-dependency standard library Python HTTP server providing:
- REST API (/api/check-password, /api/generate-password, /api/health)
- Static file serving (index.html, style.css, script.js)
- Full CORS support
"""

import http.server
import socketserver
import json
import re
import string
import secrets
import math
import os
import sys

PORT = int(os.environ.get("PORT", 5000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


def check_password_strength(password: str) -> dict:
    """Evaluate password strength following NIST/OWASP cybersecurity guidelines."""
    checks = {
        "length": len(password) >= 8,
        "uppercase": bool(re.search(r"[A-Z]", password)),
        "lowercase": bool(re.search(r"[a-z]", password)),
        "number": bool(re.search(r"\d", password)),
        "special": bool(re.search(r"[^A-Za-z0-9]", password))
    }

    score = sum(1 for passed in checks.values() if passed)
    feedback = []

    if not checks["length"]:
        feedback.append("Use at least 8 characters.")
    if not checks["uppercase"]:
        feedback.append("Add an uppercase letter (A – Z).")
    if not checks["lowercase"]:
        feedback.append("Add a lowercase letter (a – z).")
    if not checks["number"]:
        feedback.append("Add a number (0 – 9).")
    if not checks["special"]:
        feedback.append("Add a special character (e.g. !@#$%^&*).")

    levels = {
        0: "Very Weak",
        1: "Weak",
        2: "Moderate",
        3: "Good",
        4: "Strong",
        5: "Very Strong"
    }

    # Calculate Shannon Entropy
    pool_size = 0
    if checks["lowercase"]:
        pool_size += 26
    if checks["uppercase"]:
        pool_size += 26
    if checks["number"]:
        pool_size += 10
    if checks["special"]:
        pool_size += 32
    if pool_size == 0:
        pool_size = 1

    entropy = round(len(password) * math.log2(pool_size)) if password else 0

    return {
        "score": score,
        "max_score": 5,
        "level": levels.get(score, "Very Weak"),
        "feedback": feedback,
        "checks": checks,
        "entropy_bits": entropy
    }


def generate_secure_password(length: int = 16, include_upper: bool = True,
                             include_lower: bool = True, include_numbers: bool = True,
                             include_symbols: bool = True) -> str:
    """Generate cryptographically secure password using secrets module (CSPRNG)."""
    if length < 8:
        length = 8
    elif length > 128:
        length = 128

    groups = []
    if include_upper:
        groups.append(string.ascii_uppercase)
    if include_lower:
        groups.append(string.ascii_lowercase)
    if include_numbers:
        groups.append(string.digits)
    if include_symbols:
        groups.append("!@#$%^&*()-_=+[]{}|;:,.<>?/~")

    if not groups:
        groups = [string.ascii_lowercase, string.digits]

    # Guarantee at least one character from each selected set
    password = [secrets.choice(grp) for grp in groups]
    all_chars = "".join(groups)

    password.extend(secrets.choice(all_chars) for _ in range(length - len(password)))
    secrets.SystemRandom().shuffle(password)
    return "".join(password)


class PasswordSecurityHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            resp = {
                "status": "healthy",
                "app": "Password Strengthening System",
                "developer": "A0nup",
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        # Serve static files
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/check-password":
            content_len = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_len).decode("utf-8")
            try:
                data = json.loads(body) if body else {}
                password = data.get("password", "")
                result = check_password_strength(password)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        if self.path == "/api/generate-password":
            content_len = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_len).decode("utf-8")
            try:
                data = json.loads(body) if body else {}
                length = int(data.get("length", 16))
                upper = bool(data.get("uppercase", True))
                lower = bool(data.get("lowercase", True))
                numbers = bool(data.get("numbers", True))
                symbols = bool(data.get("symbols", True))

                password = generate_secure_password(length, upper, lower, numbers, symbols)
                strength = check_password_strength(password)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                resp = {
                    "password": password,
                    "length": len(password),
                    "strength": strength
                }
                self.wfile.write(json.dumps(resp).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()


def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), PasswordSecurityHandler) as httpd:
        print(f"=========================================================")
        print(f"  Password Strengthening System - Server Active")
        print(f"  Author   : A0nup")
        print(f"  URL      : http://localhost:{PORT}")
        print(f"  API Docs : /api/check-password | /api/generate-password")
        print(f"=========================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            httpd.shutdown()


if __name__ == "__main__":
    run()
