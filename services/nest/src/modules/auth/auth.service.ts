import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      iss: process.env.JWT_KEY || 'my-issuer-id', // samo ovdje!
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'secret-key',
        algorithm: 'HS256',
        expiresIn: '1h',
      }),
    };
  }

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });
    const { password: _, ...result } = user;
    return result;
  }

  async handleGoogleCallback(code: string): Promise<any> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/auth/google/callback';
    
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET || '');
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await response.json();
    const accessToken = tokenData.access_token;

    const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    const userResponse = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const profile = await userResponse.json();

    return {
      googleId: profile.id,
      email: profile.email,
      firstName: profile.given_name,
      lastName: profile.family_name,
      avatar: profile.picture,
    };
  }

  async googleLogin(userData: any) {
    const { googleId, email, firstName, lastName, avatar } = userData;

    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      user = await this.usersService.findByEmail(email);
      
      if (user) {
        user = await this.usersService.update(user.id, {
          googleId,
          avatar,
          provider: 'google',
        });
      } else {
        user = await this.usersService.create({
          email,
          googleId,
          avatar,
          provider: 'google',
        });
      }
    }

    const payload = {
      email: user.email,
      sub: user.id,
      iss: process.env.JWT_KEY || 'my-issuer-id',
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'secret-key',
        algorithm: 'HS256',
        expiresIn: '1h',
      }),
      user,
    };
  }
}
