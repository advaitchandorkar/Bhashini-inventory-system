import json
from inference_sdk import InferenceHTTPClient
from config import Config

# Create an inference client
CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key=Config.ROBOFLOW_API_KEY
)

# Run inference on a local image
inference_result = CLIENT.infer(
    "public\\icons\\final_img_data\\maggi.jpg", 
    model_id=Config.ROBOFLOW_MODEL_ID
)

# Extract class names and count their occurrences
class_counts = {}

for prediction in inference_result['predictions']:
    class_name = prediction.get('class')
    if class_name:
        if class_name in class_counts:
            class_counts[class_name] += 1
        else:
            class_counts[class_name] = 1

# Convert the result to JSON format
class_counts_json = json.dumps(class_counts, indent=4)

# Print the result
print(class_counts_json)

# Optionally, save the result to a JSON file
