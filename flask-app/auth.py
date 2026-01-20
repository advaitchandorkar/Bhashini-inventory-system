import time
from functools import wraps
import bcrypt
import jwt
from flask import request, jsonify, g
from config import Config

_rate_limits = {}

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False

def create_jwt(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": int(time.time()) + (Config.JWT_EXP_HOURS * 3600),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")

def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"message": "Missing or invalid token"}), 401
        token = auth_header.replace("Bearer ", "", 1)
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        g.user_id = payload.get("user_id")
        return fn(*args, **kwargs)
    return wrapper

def rate_limit(key_prefix: str, limit: int, window_seconds: int):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            now = int(time.time())
            key = f"{key_prefix}:{request.remote_addr}"
            entry = _rate_limits.get(key, {"count": 0, "reset": now + window_seconds})
            if now > entry["reset"]:
                entry = {"count": 0, "reset": now + window_seconds}
            entry["count"] += 1
            _rate_limits[key] = entry
            if entry["count"] > limit:
                return jsonify({"message": "Too many requests"}), 429
            return fn(*args, **kwargs)
        return wrapper
    return decorator
