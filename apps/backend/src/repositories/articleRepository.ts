import { Article } from '@prisma/client';
import { CreateArticleRequest, UpdateArticleRequest } from '@shared/types';
import { prisma } from '../config/database';

export class ArticleRepository {
  async findAll(skip?: number, take?: number, publishedOnly = false) {
    const where = publishedOnly ? { published: true } : {};
    
    return prisma.article.findMany({
      where,
      skip,
      take,
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  async findByAuthorId(authorId: string, skip?: number, take?: number) {
    return prisma.article.findMany({
      where: { authorId },
      skip,
      take,
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateArticleRequest & { authorId: string }): Promise<Article> {
    return prisma.article.create({
      data,
      include: { author: true },
    });
  }

  async update(id: string, data: UpdateArticleRequest) {
    return prisma.article.update({
      where: { id },
      data,
      include: { author: true },
    });
  }

  async delete(id: string): Promise<Article> {
    return prisma.article.delete({
      where: { id },
    });
  }

  async count(publishedOnly = false): Promise<number> {
    const where = publishedOnly ? { published: true } : {};
    return prisma.article.count({ where });
  }

  async search(query: string, skip?: number, take?: number, publishedOnly = false) {
    const where = {
      AND: [
        publishedOnly ? { published: true } : {},
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    };

    return prisma.article.findMany({
      where,
      skip,
      take,
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}