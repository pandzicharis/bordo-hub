import pika
import json
from db import get_db
from services.user_service import UserService
import os

def handle_event(event):
    event_name = event['event']
    data_json_str = event['data']
    data = json.loads(data_json_str)

    if(event_name == 'user.created'):
        print(f"[Python] 🎉 User created event received: {event_name}", data)
        # Create user in database
        db = next(get_db())
        user_service = UserService(db)
        try:
            user = user_service.create_user(
                email=data.get('email'),
                username=data.get('email'),
            )
            print(f"[Python] ✅ User created in database: {user.to_dict()}")
        except Exception as e:
            print(f"[Python] ❌ Failed to create user in database: {e}")
        finally:
            db.close()


def start_event_listener():
    rabbitMqPort = os.environ.get("RABITMQ_PORT")

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host="rabbitmq",port=rabbitMqPort)  # Port se podrazumijeva 5672
    )
    channel = connection.channel()

    channel.exchange_declare(exchange='exchange', exchange_type='fanout', durable=True)

    channel.queue_declare(queue='fastapi.users', durable=True)

    channel.queue_bind(exchange='exchange', queue='fastapi.users')

    def callback(ch, method, properties, body):
        try:
            data = json.loads(body)
            handle_event(data)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f"[ERROR] Failed to process message: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(
        queue='fastapi.users',
        on_message_callback=callback,
        auto_ack=False
    )

    print("[Python] 🟢 Waiting for events...")
    channel.start_consuming()
