import { PrismaClient, Tag } from '@prisma/client';

export class TagRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Tag[]> {
    return await this.prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: number): Promise<Tag | null> {
    return await this.prisma.tag.findUnique({
      where: { id }
    });
  }

  async findByName(name: string): Promise<Tag | null> {
    return await this.prisma.tag.findUnique({
      where: { name }
    });
  }

  async create(name: string): Promise<Tag> {
    return await this.prisma.tag.create({
      data: { name }
    });
  }

  async update(id: number, name: string): Promise<Tag | null> {
    try {
      return await this.prisma.tag.update({
        where: { id },
        data: { name }
      });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.tag.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findWithProductCount(): Promise<(Tag & { _count: { productTags: number } })[]> {
    return await this.prisma.tag.findMany({
      include: {
        _count: {
          select: {
            productTags: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

}