import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../generated/prisma';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
} 