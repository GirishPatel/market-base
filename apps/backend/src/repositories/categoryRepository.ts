import { PrismaClient } from '@prisma/client';
import { Category } from '@shared/types';

export class CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(limit?: number, offset?: number): Promise<Category[]> {
    return await this.prisma.category.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' },
      take: limit,
      skip: offset
    });
  }

  async count(): Promise<number> {
    return await this.prisma.category.count();
  }

  async findById(id: number): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true
      }
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { name },
      select: {
        id: true,
        name: true
      }
    });
  }

  async create(name: string): Promise<Category> {
    return await this.prisma.category.create({
      data: { name },
      select: {
        id: true,
        name: true
      }
    });
  }

  async findOrCreate(name: string): Promise<Category> {
    const existing = await this.findByName(name);
    if (existing) {
      return existing;
    }
    return await this.create(name);
  }

  async findProductsByCategoryId(categoryId: number, limit?: number, offset?: number): Promise<any[]> {
    return await this.prisma.product.findMany({
      where: { categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  async countProductsByCategoryId(categoryId: number): Promise<number> {
    return await this.prisma.product.count({
      where: { categoryId }
    });
  }

  async searchCategories(query: string, limit: number): Promise<any[]> {
    return await this.prisma.category.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        name: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      take: limit,
      orderBy: {
        products: {
          _count: 'desc'
        }
      }
    });
  }
}