import { PrismaClient } from '@prisma/client';
import { Brand } from '@shared/types';

export class BrandRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(limit?: number, offset?: number): Promise<Brand[]> {
    return await this.prisma.brand.findMany({
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
    return await this.prisma.brand.count();
  }

  async findById(id: number): Promise<Brand | null> {
    return await this.prisma.brand.findUnique({
      where: { id },
      select: {
        id: true,
        name: true
      }
    });
  }

  async findByName(name: string): Promise<Brand | null> {
    return await this.prisma.brand.findUnique({
      where: { name },
      select: {
        id: true,
        name: true
      }
    });
  }

  async create(name: string): Promise<Brand> {
    return await this.prisma.brand.create({
      data: { name },
      select: {
        id: true,
        name: true
      }
    });
  }

  async findOrCreate(name: string): Promise<Brand> {
    const existing = await this.findByName(name);
    if (existing) {
      return existing;
    }
    return await this.create(name);
  }

  async findProductsByBrandId(brandId: number, limit?: number, offset?: number): Promise<any[]> {
    return await this.prisma.product.findMany({
      where: { brandId },
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

  async countProductsByBrandId(brandId: number): Promise<number> {
    return await this.prisma.product.count({
      where: { brandId }
    });
  }

  async searchBrands(query: string, limit: number): Promise<any[]> {
    return await this.prisma.brand.findMany({
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