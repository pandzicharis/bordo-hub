import { UsersService } from './users.service';
import { Controller, Get } from '@nestjs/common';

@Controller('nest/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  list() {
    return this.usersService.list();
  }
}
