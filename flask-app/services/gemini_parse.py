import json
import google.generativeai as genai
from config import Config

SYSTEM_PROMPT = (
    "Extract inventory items into JSON array with fields: "
    "name, quantity, unit, price_per_unit (optional). "
    "Return ONLY valid JSON."
)

def parse_items(text: str):
    if not Config.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=Config.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(f"{SYSTEM_PROMPT}\nText:\n{text}")
    raw = response.text.strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError("Gemini did not return valid JSON")
    if not isinstance(data, list):
        raise ValueError("Gemini response is not a list")
    return data
