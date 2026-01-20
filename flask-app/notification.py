from twilio.rest import Client
import pyttsx3
import time
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import Config
from db import get_db
# Initialize Twilio client
client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)

# Function to fetch data from the database
def fetch_data(id):
    db = get_db()
    user_collection = db["inventory_items"]
    inventory_data = list(user_collection.find(
        {"user_id": id, "quantity": {"$lt": 10}},
        {"_id": 0, "name": 1, "quantity": 1, "price_per_unit": 1},
    ))
    # print(user_id,inventory_data,"dwijskcnkcxknxn")
    print(inventory_data)
    return inventory_data

def send_combined_sms(receiver_number, items):
    twilio_phone_number = Config.TWILIO_FROM_NUMBER
    message_body = "\n".join([
        f"Product Name: {item[0]}, Quantity: {item[1]}, Price: ₹{item[2]:.2f}"
        for item in items
    ])
    message = client.messages.create(
        body=f"Items needing restocking:\n{message_body}\nRestock NOW !!!",
        from_=twilio_phone_number,
        to=receiver_number
    )
    print("Message SID:", message.sid)

# Function to send combined email notification
def send_combined_email(receiver_email, items):
    sender_email = Config.SMTP_SENDER
    password = Config.SMTP_PASSWORD

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = receiver_email
    message['Subject'] = "Inventory Notification"

    message_body = "\n".join([
        f"Product Name: {item[0]}, Quantity: {item[1]}, Price: ₹{item[2]:.2f}"
        for item in items
    ])
    print(message_body)
    body = f"Items needing restocking:\n{message_body}\nRestock NOW !!! "
    message.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
        server.starttls()
        server.login(Config.SMTP_USER, password)
        server.sendmail(sender_email, receiver_email, message.as_string())

# Function to convert text to speech
def convert_to_speech(product_name, quantity):
    engine = pyttsx3.init()
    engine.say(f"Product Name: {product_name}, Quantity: {quantity}")
    engine.runAndWait()

# Main function to send notifications every 5 hours
def send_notifications():
    while True:
        # Fetch data from the database
        data = fetch_data()

        # Accumulate items needing restocking
        items_needing_restocking = []

        for product in data:
            product_name, quantity = product
            items_needing_restocking.append((product_name, quantity))

        # Check if any items need restocking
        if items_needing_restocking:
            # Send combined SMS notification using Twilio
            receiver_number = Config.TWILIO_FROM_NUMBER
            send_combined_sms(receiver_number, items_needing_restocking)

            # Send combined email notification
            receiver_email = Config.SMTP_SENDER
            send_combined_email(receiver_email, items_needing_restocking)

            # Convert text to speech for each item separately
            for item in items_needing_restocking:
                product_name, quantity = item
                convert_to_speech(product_name, quantity)

        # Sleep for 5 hours before sending the next notification
        time.sleep(5 * 60 * 60)

# Function to trigger notifications manually
def trigger_notifications_manually(id):

    data = fetch_data(id)

    # Accumulate items needing restocking
    items_needing_restocking = []

    for product in data:
        items_needing_restocking.append((product['product_name'], product['quantity'],product['price']))
        print(items_needing_restocking)

    # Check if any items need restocking
    if items_needing_restocking:
        # Send combined SMS notification using Twilio
        receiver_number = Config.TWILIO_FROM_NUMBER
        send_combined_sms(receiver_number, items_needing_restocking)

        # Send combined email notification
        receiver_email = Config.SMTP_SENDER
        send_combined_email(receiver_email, items_needing_restocking)

        # Convert text to speech for each item separately
        # for item in items_needing_restocking:
        #     product_name, quantity = item
        #     convert_to_speech(product_name, quantity)

# Example usage of manual trigger
# trigger_notifications_manually()
