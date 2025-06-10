import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { User as dbUser }  from './../../generated/prisma/index.d';
import { User }  from './../auth/decorators/user';
import { UsersService } from './users.service';
import { Controller, Get, UseGuards,Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

@Controller('nest/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async list(@Request() req: ExpressRequest, @User() user: dbUser) {
    const users = await this.usersService.list();
    return { users, user };
  }
}
