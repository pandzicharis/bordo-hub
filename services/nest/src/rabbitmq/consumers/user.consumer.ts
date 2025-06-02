import { RedisService } from './../../redis/redis.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';

@Injectable()
export class UserConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consumeExchange('nest-user-queue', this.handleEvent.bind(this));
  }

  private async handleEvent(event: any) {
    const data = JSON.parse(event.data);

    if (event.event === 'user.created') {
      console.log('USER.CREATED NEST', data);
      this.redisService.set(`user:${data.id}`, data.active);
    }
  }
}
