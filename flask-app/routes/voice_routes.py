import os
from flask import Blueprint, request, jsonify
from auth import auth_required, rate_limit
from services.bhashini_asr import transcribe_audio
from services.gemini_parse import parse_items
from services.normalize import validate_item

voice_routes = Blueprint("voice_routes", __name__, url_prefix="/api/voice")

@voice_routes.post("/transcribe")
@auth_required
@rate_limit("voice_transcribe", limit=10, window_seconds=60)
def transcribe():
    if "file" not in request.files:
        return jsonify({"message": "Missing audio file"}), 400
    audio_file = request.files["file"]
    audio_bytes = audio_file.read()
    if not audio_bytes:
        return jsonify({"message": "Empty audio file"}), 400
    ext = os.path.splitext(audio_file.filename or "")[1].lstrip(".") or "wav"
    transcript = transcribe_audio(audio_bytes, audio_format=ext)
    return jsonify({"transcript": transcript}), 200

@voice_routes.post("/parse")
@auth_required
@rate_limit("voice_parse", limit=10, window_seconds=60)
def parse():
    data = request.get_json() or {}
    transcript = data.get("transcript", "")
    if not transcript:
        return jsonify({"message": "Transcript is required"}), 400
    try:
        items = parse_items(transcript)
    except Exception as error:
        return jsonify({"message": str(error)}), 500
    normalized_items = []
    errors = []
    for item in items:
        normalized, error = validate_item({**item, "source": "voice"})
        if error:
            errors.append({"item": item, "message": error})
        else:
            normalized_items.append(normalized)
    return jsonify({"items": normalized_items, "errors": errors}), 200
