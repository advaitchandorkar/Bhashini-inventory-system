import re

ALLOWED_UNITS = {"pcs", "kg", "g", "litre", "ml", "pack", "box"}

_UNIT_ALIASES = {
    "piece": "pcs",
    "pieces": "pcs",
    "pc": "pcs",
    "dozen": "pcs",
    "liter": "litre",
    "liters": "litre",
    "ltr": "litre",
    "mls": "ml",
}

def normalize_name(name: str) -> str:
    cleaned = re.sub(r"\s+", " ", name or "").strip()
    return cleaned

def normalize_unit(unit: str) -> str:
    unit = (unit or "").strip().lower()
    unit = _UNIT_ALIASES.get(unit, unit)
    return unit

def normalize_quantity(quantity, unit: str):
    unit = normalize_unit(unit)
    try:
        quantity_val = float(quantity)
    except (TypeError, ValueError):
        return None, unit

    if unit == "pcs" and isinstance(quantity, str) and "dozen" in quantity.lower():
        return 12.0, unit
    if isinstance(quantity, str) and "half" in quantity.lower():
        return 0.5, unit

    return quantity_val, unit

def validate_item(item):
    name = normalize_name(item.get("name"))
    quantity = item.get("quantity")
    unit = normalize_unit(item.get("unit"))

    quantity_val, unit = normalize_quantity(quantity, unit)
    if not name:
        return None, "Name is required"
    if unit not in ALLOWED_UNITS:
        return None, f"Unit '{unit}' is not allowed"
    if quantity_val is None or quantity_val < 0:
        return None, "Quantity must be >= 0"

    price = item.get("price_per_unit")
    try:
        price_val = float(price) if price is not None and price != "" else None
    except (TypeError, ValueError):
        price_val = None

    normalized = {
        "name": name,
        "name_normalized": name.lower(),
        "quantity": quantity_val,
        "unit": unit,
        "price_per_unit": price_val,
        "currency": item.get("currency", "INR"),
        "source": item.get("source", "manual"),
    }
    return normalized, None
