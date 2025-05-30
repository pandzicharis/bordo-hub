import { User } from './../../generated/prisma/index.d';
import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';

@Injectable()
export class UserPublisher {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async emitCreateUser(payload: User) {
    await this.rabbitMQService.publishToExchange({
      event: 'user.created',
      data: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
    });
  }
}
