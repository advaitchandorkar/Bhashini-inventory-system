import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "change-me")
    MONGO_URI = os.getenv("MONGO_URI", "")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

    JWT_EXP_HOURS = int(os.getenv("JWT_EXP_HOURS", "24"))

    BHASHINI_API_URL = os.getenv("BHASHINI_API_URL", "")
    BHASHINI_ULCA_API_KEY = os.getenv("BHASHINI_ULCA_API_KEY", "")
    BHASHINI_USER_ID = os.getenv("BHASHINI_USER_ID", "")
    BHASHINI_AUTHORIZATION = os.getenv("BHASHINI_AUTHORIZATION", "")
    BHASHINI_ASR_SERVICE_ID = os.getenv("BHASHINI_ASR_SERVICE_ID", "")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY", "")
    ROBOFLOW_MODEL_ID = os.getenv("ROBOFLOW_MODEL_ID", "")

    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")

    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_SENDER = os.getenv("SMTP_SENDER", "")
