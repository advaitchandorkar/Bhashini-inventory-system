
import base64
import re
import google.generativeai as genai
from flask import jsonify
from config import Config
from db import get_db
import requests

# Legacy script: prefer /api/voice endpoints in app.py.
db = get_db()
inventory_collection = db["inventory_items"]


def delete_inventory():
    with open("recorded_audio.wav", "rb") as audio_file:
        audio_data = audio_file.read()
        base64_encoded_audio_data = base64.b64encode(audio_data).decode("utf-8")
    print("test file started")
# Define your actual values
    source_language = "en"
    asr_service_id = "ai4bharat/whisper-medium-en--gpu--t4"
    base64_audio_content = base64_encoded_audio_data
    # API endpoint for ASR
    asr_url = Config.BHASHINI_API_URL

    # Request payload for ASR
    asr_payload = {
        "pipelineTasks": [
            {
                "taskType": "asr",
                "config": {
                    "language": {
                        "sourceLanguage": source_language
                    },
                    "serviceId": asr_service_id,
                    "audioFormat": "wav",  # Corrected audio format
                    "samplingRate": 16000
                }
            }
        ],
        "inputData": {
            "audio": [
                {
                    "audioContent": base64_audio_content
                }
            ]
        }
    }

    # Headers for the request
    headers = {
        "Content-Type": "application/json",
        "ULCA_API_KEY": Config.BHASHINI_ULCA_API_KEY,
        "USER_ID": Config.BHASHINI_USER_ID,
        "Authorization": Config.BHASHINI_AUTHORIZATION,
    }

    # Send POST request to ASR API with headers
    response = requests.post(asr_url, json=asr_payload, headers=headers)

    # Print the response
    if response.ok:
        # Parse the JSON response
        response_data = response.json()
        data = response_data['pipelineResponse'][0]['output'][0]['source']
    else:
        print("Error:", response.status_code, response.reason)

    genai.configure(api_key=Config.GEMINI_API_KEY)

    model = genai.GenerativeModel('gemini-pro')
    question = ' This system will streamline categorization and retrieval processes by accurately extracting essential terms such as product company , product name, quantity, and price(only these are to be extracted). Follow this format for example : Parle biscuit: 5 packets, 10rs each.  Ensure high-level accuracy in recognizing crucial details to optimize inventory management workflows and facilitate seamless integration with inventory systems.'
    response = model.generate_content(f'{question } {data}')

    print(response.text)


    
    product_name_list = []
    quantity_list = []
    price_list = []

    # Extract information from the response
    items = response.text.strip().split('\n')
    print(items)
    for item in items:
        data = item.split(":")
        product_name = data[0].lstrip('-').strip()
        product_name_list.append(product_name)

        # Extract numbers from the second element
        numbers = re.findall(r'\d+', data[1])
        quantity = int(numbers[0])
        price = int(numbers[1])
        quantity_list.append(quantity)
        price_list.append(price)

        existing_product = inventory_collection.find_one({
            "name_normalized": product_name.lower(),
        })

        if existing_product:
            print("doing something")
            # If the product exists, update the quantity
            if ((existing_product["quantity"] - quantity) < 0):
                return jsonify({"message":"Quantity cannot be zero"})
            new_quantity = existing_product["quantity"] - quantity
            inventory_collection.update_one(
                {"_id": existing_product["_id"]},
                {"$set": {"quantity": new_quantity}}
            )

    return jsonify({"message": "good"})
   
