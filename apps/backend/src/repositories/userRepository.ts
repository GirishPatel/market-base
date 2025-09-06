import { User, Prisma } from '@prisma/client';
import { CreateUserRequest, UpdateUserRequest } from '@shared/types';
import { prisma } from '../config/database';

export class UserRepository {
  async findAll(skip?: number, take?: number): Promise<User[]> {
    return prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { articles: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserRequest): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserRequest): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }

  async search(query: string, skip?: number, take?: number): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}