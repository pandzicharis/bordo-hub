import { UserPublisher } from './../../rabbitmq/publishers/user.publisher';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private userPublisher: UserPublisher,
  ) {}

  async list() {
    return this.prisma.user.findMany({});
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    const user = await this.prisma.user.create({
      data: { ...data },
    });

    this.userPublisher.emitCreateUser(user);

    return user;
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
