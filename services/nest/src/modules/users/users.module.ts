import { UsersController } from './users.controller';
import { PrismaService } from './../prisma/prisma.service';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
