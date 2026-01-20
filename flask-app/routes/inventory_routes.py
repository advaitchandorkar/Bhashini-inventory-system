from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from bson.objectid import ObjectId
from auth import auth_required
from db import get_db
from services.normalize import validate_item, ALLOWED_UNITS, normalize_unit

inventory_routes = Blueprint("inventory_routes", __name__, url_prefix="/api/inventory")

def _timestamp():
    return datetime.now(timezone.utc)

@inventory_routes.get("")
@auth_required
def list_inventory():
    db = get_db()
    items = list(db["inventory_items"].find({"user_id": g.user_id}))
    for item in items:
        item["_id"] = str(item["_id"])
    return jsonify(items), 200

@inventory_routes.post("")
@auth_required
def create_item():
    data = request.get_json() or {}
    normalized, error = validate_item({**data, "source": "manual"})
    if error:
        return jsonify({"message": error}), 400
    db = get_db()
    inventory = db["inventory_items"]
    existing = inventory.find_one({
        "user_id": g.user_id,
        "name_normalized": normalized["name_normalized"],
    })
    now = _timestamp()
    if existing:
        inventory.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "quantity": existing["quantity"] + normalized["quantity"],
                "updated_at": now,
            }},
        )
        return jsonify({"message": "Updated existing item"}), 200
    normalized.update({
        "user_id": g.user_id,
        "created_at": now,
        "updated_at": now,
    })
    result = inventory.insert_one(normalized)
    return jsonify({"id": str(result.inserted_id)}), 201

@inventory_routes.post("/bulk_upsert")
@auth_required
def bulk_upsert():
    data = request.get_json() or {}
    items = data.get("items", [])
    if not isinstance(items, list):
        return jsonify({"message": "items must be a list"}), 400
    db = get_db()
    inventory = db["inventory_items"]
    results = []
    for item in items:
        normalized, error = validate_item(item)
        if error:
            results.append({"status": "error", "message": error, "item": item})
            continue
        now = _timestamp()
        existing = inventory.find_one({
            "user_id": g.user_id,
            "name_normalized": normalized["name_normalized"],
        })
        if existing:
            inventory.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "quantity": existing["quantity"] + normalized["quantity"],
                    "updated_at": now,
                }},
            )
            results.append({"status": "updated", "name": normalized["name"]})
        else:
            normalized.update({
                "user_id": g.user_id,
                "created_at": now,
                "updated_at": now,
            })
            inventory.insert_one(normalized)
            results.append({"status": "created", "name": normalized["name"]})
    return jsonify({"results": results}), 200

@inventory_routes.patch("/<item_id>")
@auth_required
def update_item(item_id):
    data = request.get_json() or {}
    updates = {}
    if "quantity" in data:
        try:
            quantity = float(data["quantity"])
        except (TypeError, ValueError):
            return jsonify({"message": "Quantity must be a number"}), 400
        if quantity < 0:
            return jsonify({"message": "Quantity must be >= 0"}), 400
        updates["quantity"] = quantity
    if "name" in data:
        normalized, error = validate_item({
            "name": data.get("name"),
            "quantity": data.get("quantity", 0),
            "unit": data.get("unit", "pcs"),
        })
        if error:
            return jsonify({"message": error}), 400
        updates["name"] = normalized["name"]
        updates["name_normalized"] = normalized["name_normalized"]
    if "unit" in data:
        unit = normalize_unit(data["unit"])
        if unit not in ALLOWED_UNITS:
            return jsonify({"message": "Unit is not allowed"}), 400
        updates["unit"] = unit
    if "price_per_unit" in data:
        updates["price_per_unit"] = data["price_per_unit"]
    if not updates:
        return jsonify({"message": "No updates provided"}), 400
    updates["updated_at"] = _timestamp()
    db = get_db()
    inventory = db["inventory_items"]
    result = inventory.update_one(
        {"_id": ObjectId(item_id), "user_id": g.user_id},
        {"$set": updates},
    )
    if result.matched_count == 0:
        return jsonify({"message": "Item not found"}), 404
    return jsonify({"message": "Updated"}), 200

@inventory_routes.delete("/<item_id>")
@auth_required
def delete_item(item_id):
    db = get_db()
    inventory = db["inventory_items"]
    result = inventory.delete_one({"_id": ObjectId(item_id), "user_id": g.user_id})
    if result.deleted_count == 0:
        return jsonify({"message": "Item not found"}), 404
    return jsonify({"message": "Deleted"}), 200
