import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password_hash: registerDto.password, // usersService will hash it
    });

    // Assign default role: AUTHOR
    let authorRole = await this.prisma.role.findUnique({ where: { name: 'AUTHOR' } });
    if (!authorRole) {
      authorRole = await this.prisma.role.create({ data: { name: 'AUTHOR' } });
    }

    await this.prisma.userRole.create({
      data: {
        user_id: user.id,
        role_id: authorRole.id,
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password_hash, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken || !refreshToken.includes('.')) {
      throw new UnauthorizedException('Invalid refresh token format');
    }
    
    const [userId, tokenValue] = refreshToken.split('.');
    
    const user = await this.usersService.findOne(userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Access denied');
    }

    const tokenRecords = await this.prisma.refreshToken.findMany({
      where: { user_id: userId, revoked_at: null },
    });

    let validRecord = null;
    for (const record of tokenRecords) {
      if (await argon2.verify(record.token_hash, tokenValue)) {
        validRecord = record;
        break;
      }
    }

    if (!validRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > validRecord.expires_at) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: validRecord.id },
      data: { revoked_at: new Date() },
    });

    return this.generateTokens(user.id, user.email);
  }

  async logout(refreshToken: string) {
    if (!refreshToken || !refreshToken.includes('.')) return;
    const [userId, tokenValue] = refreshToken.split('.');
    
    const tokenRecords = await this.prisma.refreshToken.findMany({
      where: { user_id: userId, revoked_at: null },
    });

    for (const record of tokenRecords) {
      if (await argon2.verify(record.token_hash, tokenValue)) {
        await this.prisma.refreshToken.update({
          where: { id: record.id },
          data: { revoked_at: new Date() },
        });
        break;
      }
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN')! as any,
    });

    const randomValue = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = await argon2.hash(randomValue);
    
    // Composite token to easily look up by user ID
    const refreshToken = `${userId}.${randomValue}`;
    
    // Refresh token expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: refreshTokenHash,
        expires_at: expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
