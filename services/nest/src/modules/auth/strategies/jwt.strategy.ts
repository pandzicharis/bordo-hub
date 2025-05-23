import { UsersService } from './../../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret-key',
      issuer: process.env.JWT_KEY || 'my-issuer-id',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findByEmail(payload.email);

    if (!user || !user.active) {
      throw new UnauthorizedException('User not found!');
    }

    return user;
  }
}
