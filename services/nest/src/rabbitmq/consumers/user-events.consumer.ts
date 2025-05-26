import { RedisService } from './../../redis/redis.service';
import { RabbitMQService } from './../rabbitmq.service';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class UserEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserEventsConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.subscribe('user.queue', 'user.events', async (message) => {
      if (message.event === 'user.created') {
        const user = message.data;
        await this.redisService.set('users', user.id, user.active);
        this.logger.log(`User saved to Redis: ${user.id}`);
      }
    });
  }
}
