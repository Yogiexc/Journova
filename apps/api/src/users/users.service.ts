import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as argon2 from 'argon2';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hash = await argon2.hash(data.password_hash);
    
    return this.prisma.user.create({
      data: {
        ...data,
        password_hash: hash,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: { roles: { include: { role: true } } },
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    if (data.password_hash) {
      data.password_hash = await argon2.hash(data.password_hash as string);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'DEACTIVATED' },
    });
  }
}
