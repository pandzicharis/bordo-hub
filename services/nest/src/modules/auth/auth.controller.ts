import { RegisterDto, LoginDto } from './../../../dto/auth.dto';
import { User as dbUser } from './../../generated/prisma/index.d';
import { User } from './decorators/user';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validate(@Request() req: ExpressRequest, @User() user: dbUser) {
    return user;
  }

  @Get('google')
  async googleAuth(@Res() res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/auth/google/callback');
    
    if (!clientId) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    return res.json({ url: googleAuthUrl });
  }

  @Get('google/callback')
  async googleAuthCallback(@Request() req: ExpressRequest, @Res() res: Response) {
    const code = req.query.code as string;
    
    if (!code) {
      return res.redirect('http://localhost:4200/login?error=no_code');
    }
    
    try {
      const user = await this.authService.handleGoogleCallback(code);
      
      if (!user) {
        return res.redirect('http://localhost:4200/login?error=authentication_failed');
      }
      
      const result = await this.authService.googleLogin(user);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const token = result.access_token;
      const redirectUrl = `${frontendUrl}/auth/callback#access_token=${token}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      return res.redirect('http://localhost:4200/login?error=authentication_failed');
    }
  }
}
