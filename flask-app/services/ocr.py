from io import BytesIO

try:
    from PIL import Image
    import pytesseract
except ImportError:  # pragma: no cover - optional dependency
    Image = None
    pytesseract = None

def extract_text(image_bytes: bytes) -> str:
    if Image is None or pytesseract is None:
        raise RuntimeError("OCR dependencies missing: install pillow and pytesseract")
    image = Image.open(BytesIO(image_bytes))
    return pytesseract.image_to_string(image)
