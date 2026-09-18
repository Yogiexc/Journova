import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from './roles.guard.js';
import { Roles } from './roles.decorator.js';

@UseGuards(ThrottlerGuard)
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(registerDto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { access_token: tokens.accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(loginDto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { access_token: tokens.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { access_token: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    const user = req.user;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles?.map((r: any) => r.role.name) || [],
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  @Get('editor-only')
  getEditorOnly() {
    return { message: 'Hello Editor!' };
  }
}
