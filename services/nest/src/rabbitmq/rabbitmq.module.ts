import { UserPublisher } from './publishers/user.publisher';
import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { UserConsumer } from './consumers/user.consumer';

@Global()
@Module({
  providers: [RabbitMQService, UserPublisher, UserConsumer],
  exports: [RabbitMQService, UserPublisher, UserConsumer],
})
export class RabbitMQModule {}
