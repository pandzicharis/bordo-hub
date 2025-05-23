import { User } from './../../../generated/prisma/index.d';
import { AuthService } from './../auth.service';
import { UsersService } from './../../users/users.service';
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly userService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Invalid token!');
    }

    const dbUser = await this.userService.findById((user as unknown as User)?.id);

    if (!dbUser || !dbUser.active) {
      throw new UnauthorizedException('Invalid user!');
    }

    return true;
  }
}
