from pymongo import MongoClient, ASCENDING
from config import Config

_client = None

def get_client():
    global _client
    if _client is None:
        if not Config.MONGO_URI:
            raise RuntimeError("MONGO_URI is not set")
        _client = MongoClient(Config.MONGO_URI)
    return _client

def get_db():
    client = get_client()
    return client.get_default_database()

def ensure_indexes():
    db = get_db()
    inventory = db["inventory_items"]
    inventory.create_index(
        [("user_id", ASCENDING), ("name_normalized", ASCENDING)],
        unique=True,
        name="user_name_unique",
    )
    inventory.create_index([("user_id", ASCENDING)], name="user_id_idx")
