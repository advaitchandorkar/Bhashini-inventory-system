import json
import os
from flask import Blueprint, request, jsonify
from auth import auth_required, rate_limit

barcode_routes = Blueprint("barcode_routes", __name__, url_prefix="/api/barcode")

def _load_barcode_lookup():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "barcodes.json")
    if not os.path.exists(data_path):
        return {}
    with open(data_path, "r", encoding="utf-8") as file:
        return json.load(file)

@barcode_routes.post("/lookup")
@auth_required
@rate_limit("barcode_lookup", limit=30, window_seconds=60)
def lookup():
    data = request.get_json() or {}
    barcode = data.get("barcode")
    if not barcode:
        return jsonify({"message": "barcode is required"}), 400
    lookup_table = _load_barcode_lookup()
    item = lookup_table.get(barcode)
    if not item:
        return jsonify({"message": "Barcode not found", "item": None}), 404
    return jsonify({"item": item}), 200
