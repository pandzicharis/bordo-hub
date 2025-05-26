import { RabbitMQService } from './../../rabbitmq/rabbitmq.service';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private rabbitMQService: RabbitMQService,
  ) {}

  async list() {
    return this.prisma.user.findMany({});
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { email: string; password: string }) {
    const user = await this.prisma.user.create({ data });

    await this.rabbitMQService.publish(
      {
        event: 'user.created',
        data: user,
      },
      'user.queue',
      'user.events',
    );

    return user;
  }
}
