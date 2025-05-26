import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly logger = new Logger(RabbitMQService.name);

  private readonly uri = 'amqp://rabbitmq:5672';
  private readonly queue = 'main_queue';

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.uri);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange('main_exchange', 'direct', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });
      await this.channel.bindQueue(this.queue, 'main_exchange', this.queue);
      this.logger.log(`✅ Connected to RabbitMQ. Queue '${this.queue}' is ready.`);
    } catch (error) {
      this.logger.error('❌ RabbitMQ connection error:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(message: Record<string, any>, queue: string = this.queue, routingKey?: string) {
    if (!this.channel) throw new Error('Channel is not ready');
    routingKey = routingKey || queue;
    const payload = Buffer.from(JSON.stringify(message));
    this.channel.publish('main_exchange', routingKey, payload);
  }

  async subscribe(queue: string, routingKey: string, callback: (msg: any) => Promise<void>) {
    if (!this.channel) throw new Error('Channel is not ready');

    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, 'main_exchange', routingKey);

    await this.channel.consume(queue, async (msg: amqp.ConsumeMessage | null) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await callback(data);
          this.channel.ack(msg);
        } catch (err) {
          this.logger.error('❌ Failed to process message', err);
          this.channel.nack(msg, false, false);
        }
      }
    });
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.logger.log('👋 RabbitMQ connection closed.');
  }
}
