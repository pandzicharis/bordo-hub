import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  private channel!: any;
  private connection!: any;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        this.connection = await amqp.connect('amqp://rabbitmq:5672');
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange('exchange', 'fanout', {
          durable: true,
        });

        this.isInitialized = true;
        this.logger.log('✅ Connected to RabbitMQ');
      } catch (error: any) {
        this.logger.error(`❌ RabbitMQ connection error: ${error.message}`);
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async publishToExchange(event: any) {
    await this.ensureInitialized();

    this.channel.publish('exchange', '', Buffer.from(JSON.stringify(event)), { persistent: true });
  }

  async consumeExchange(queueName: string, callback: (event: any) => Promise<void>) {
    await this.ensureInitialized();

    await this.channel.assertQueue(queueName, {
      durable: true,
    });

    await this.channel.bindQueue(queueName, 'exchange', '');

    await this.channel.consume(queueName, async (msg: any) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        await callback(content);
        this.channel.ack(msg);
      }
    });
  }
}
