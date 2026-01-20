import base64
import requests
from config import Config

def transcribe_audio(audio_bytes: bytes, audio_format: str = "wav"):
    if not Config.BHASHINI_API_URL:
        raise RuntimeError("BHASHINI_API_URL is not set")
    headers = {
        "Content-Type": "application/json",
        "ULCA_API_KEY": Config.BHASHINI_ULCA_API_KEY,
        "USER_ID": Config.BHASHINI_USER_ID,
        "Authorization": Config.BHASHINI_AUTHORIZATION,
    }
    payload = {
        "pipelineTasks": [
            {
                "taskType": "asr",
                "config": {
                    "language": {"sourceLanguage": "en"},
                    "serviceId": Config.BHASHINI_ASR_SERVICE_ID,
                    "audioFormat": audio_format,
                    "samplingRate": 16000,
                },
            }
        ],
        "inputData": {
            "audio": [
                {"audioContent": base64.b64encode(audio_bytes).decode("utf-8")}
            ]
        },
    }
    response = requests.post(Config.BHASHINI_API_URL, json=payload, headers=headers, timeout=60)
    if not response.ok:
        raise RuntimeError(f"ASR failed: {response.status_code} {response.text}")
    response_data = response.json()
    return response_data["pipelineResponse"][0]["output"][0]["source"]
