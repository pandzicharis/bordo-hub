import { RedisService } from './../../../redis/redis.service';
import { User } from './../../../generated/prisma/index.d';
import { UsersService } from './../../users/users.service';
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly userService: UsersService,
    private readonly redisService: RedisService,
  ) {
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

    const redisActive = await this.redisService.get('users', userId);
    if (redisActive !== null) {
      isActive = redisActive === 'true';
      console.log('Getting user active status from Redis:', userId, isActive);
    } else {
      const dbUser = await this.userService.findById(userId);
      if (!dbUser) {
        throw new UnauthorizedException('Invalid user!');
      }

      isActive = dbUser.active;

      await this.redisService.set('users', userId, String(dbUser.active));
    }

    if (!isActive) {
      throw new UnauthorizedException('Inactive user!');
    }

    return true;
  }
}
