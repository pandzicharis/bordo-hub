import { User } from './../../../generated/prisma/index.d';
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

    const userId = (user as unknown as User)?.id;
    let isActive: boolean | null = null;

    const dbUser = await this.userService.findById(userId);
    if (!dbUser) {
      throw new UnauthorizedException('Invalid user!');
    }

    isActive = dbUser.active;

    if (!isActive) {
      throw new UnauthorizedException('Inactive user!');
    }

    return true;
  }
}
