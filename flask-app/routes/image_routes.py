from flask import Blueprint, request, jsonify
from auth import auth_required, rate_limit
from services.ocr import extract_text
from services.gemini_parse import parse_items
from services.normalize import validate_item
from config import Config
import tempfile

try:
    from inference_sdk import InferenceHTTPClient
except ImportError:  # pragma: no cover
    InferenceHTTPClient = None

image_routes = Blueprint("image_routes", __name__, url_prefix="/api/image")

def _roboflow_fallback(image_bytes: bytes):
    if InferenceHTTPClient is None or not Config.ROBOFLOW_API_KEY:
        return []
    client = InferenceHTTPClient(
        api_url="https://detect.roboflow.com",
        api_key=Config.ROBOFLOW_API_KEY,
    )
    with tempfile.NamedTemporaryFile(suffix=".jpg") as temp_file:
        temp_file.write(image_bytes)
        temp_file.flush()
        result = client.infer(temp_file.name, model_id=Config.ROBOFLOW_MODEL_ID)
    class_counts = {}
    for prediction in result.get("predictions", []):
        class_name = prediction.get("class")
        if class_name:
            class_counts[class_name] = class_counts.get(class_name, 0) + 1
    return [{"name": name, "quantity": count, "unit": "pcs"} for name, count in class_counts.items()]

@image_routes.post("/extract")
@auth_required
@rate_limit("image_extract", limit=10, window_seconds=60)
def extract():
    if "file" not in request.files:
        return jsonify({"message": "Missing image file"}), 400
    image_file = request.files["file"]
    image_bytes = image_file.read()
    if not image_bytes:
        return jsonify({"message": "Empty image file"}), 400
    items = []
    try:
        ocr_text = extract_text(image_bytes)
        items = parse_items(ocr_text)
    except Exception:
        items = _roboflow_fallback(image_bytes)
        if not items:
            return jsonify({"message": "OCR failed and no fallback available"}), 500

    normalized_items = []
    errors = []
    for item in items:
        normalized, error = validate_item({**item, "source": "image"})
        if error:
            errors.append({"item": item, "message": error})
        else:
            normalized_items.append(normalized)
    return jsonify({"items": normalized_items, "errors": errors}), 200
