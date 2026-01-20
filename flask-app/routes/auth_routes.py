from flask import Blueprint, request, jsonify, g
from bson.objectid import ObjectId
from auth import hash_password, check_password, create_jwt, rate_limit, auth_required
from db import get_db

auth_routes = Blueprint("auth_routes", __name__, url_prefix="/api/auth")

@auth_routes.post("/signup")
@rate_limit("signup", limit=10, window_seconds=60)
def signup():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    db = get_db()
    users = db["users"]
    if users.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 400
    user_data = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "phone": data.get("phone"),
        "address": data.get("address"),
        "city": data.get("city"),
        "state": data.get("state"),
        "postalCode": data.get("postalCode"),
        "shopName": data.get("shopName"),
    }
    result = users.insert_one(user_data)
    token = create_jwt(str(result.inserted_id))
    return jsonify({"token": token}), 201

@auth_routes.post("/login")
@rate_limit("login", limit=10, window_seconds=60)
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    db = get_db()
    users = db["users"]
    user = users.find_one({"email": email})
    if not user or not check_password(password, user.get("password", "")):
        return jsonify({"message": "Invalid credentials"}), 401
    token = create_jwt(str(user["_id"]))
    return jsonify({"token": token}), 200

@auth_routes.get("/me")
@auth_required
def me():
    db = get_db()
    users = db["users"]
    user = users.find_one({"_id": ObjectId(g.user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return jsonify(user), 200
