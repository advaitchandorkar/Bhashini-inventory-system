from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import ensure_indexes
from routes.auth_routes import auth_routes
from routes.inventory_routes import inventory_routes
from routes.voice_routes import voice_routes
from routes.image_routes import image_routes
from routes.barcode_routes import barcode_routes

app = Flask(__name__)
app.config["SECRET_KEY"] = Config.SECRET_KEY
cors_origins = [Config.FRONTEND_ORIGIN] if Config.FRONTEND_ORIGIN else "*"
CORS(app, origins=cors_origins)

app.register_blueprint(auth_routes)
app.register_blueprint(inventory_routes)
app.register_blueprint(voice_routes)
app.register_blueprint(image_routes)
app.register_blueprint(barcode_routes)

try:
    ensure_indexes()
except Exception:
    pass

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    ensure_indexes()
    app.run(debug=True)
