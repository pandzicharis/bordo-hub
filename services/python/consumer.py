import pika
import json

def handle_event(event):
    event_name = event['event']

    data_json_str = event['data']
    data = json.loads(data_json_str)

    if(event_name == 'user.created'):
        print(f"[Python] 🎉 User created event received: {event_name}",data)


def start_event_listener():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host="rabbitmq",port=5672)  # Port se podrazumijeva 5672
    )
    channel = connection.channel()

    channel.exchange_declare(exchange='exchange', exchange_type='fanout', durable=True)

    channel.queue_declare(queue='fastapi.user.created', durable=True)

    channel.queue_bind(exchange='exchange', queue='fastapi.user.created')

    def callback(ch, method, properties, body):
        try:
            data = json.loads(body)
            handle_event(data)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f"[ERROR] Failed to process message: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(
        queue='fastapi.user.created',
        on_message_callback=callback,
        auto_ack=False
    )

    print("[Python] 🟢 Waiting for events...")
    channel.start_consuming()
