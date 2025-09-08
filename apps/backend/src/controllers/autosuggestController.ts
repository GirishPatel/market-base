import { Request, Response } from 'express';
import { elasticsearchClient } from '../config/elasticsearch';
import { CategoryRepository } from '../repositories/categoryRepository';
import { BrandRepository } from '../repositories/brandRepository';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS } from '@shared/types';

export class AutosuggestController {
  private categoryRepository: CategoryRepository;
  private brandRepository: BrandRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository(prisma);
    this.brandRepository = new BrandRepository(prisma);
  }

  suggestBrands = asyncHandler(async (req: Request, res: Response) => {
    const { q: query, size = '10' } = req.query;

    if (!query || typeof query !== 'string' || query.length < 3) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Bad Request',
        message: 'Query parameter "q" is required and must be at least 3 characters long'
      });
    }

    const maxSize = Math.min(parseInt(size as string) || 10, 50);

    try {
      // Use Elasticsearch aggregation for brand suggestions with counts
      const response = await elasticsearchClient.search({
        index: 'products',
          size: 0,
          query: {
            match: {
              'brand.suggest': {
                query: query,
                operator: 'and'
              }
            }
          },
          aggs: {
            brand_suggestions: {
              terms: {
                field: 'brand.keyword',
                size: maxSize,
                order: { _count: 'desc' }
              }
            }
          }
      });

      const brandAgg = response.aggregations?.brand_suggestions as any;
      const suggestions = brandAgg?.buckets?.map((bucket: any) => ({
        text: bucket.key,
        count: bucket.doc_count
      })) || [];

      res.json({
        query,
        suggestions
      });
    } catch (error) {
      console.error('Elasticsearch brand suggestion failed:', error);
      
      // Fallback to database search
      const brands = await this.brandRepository.searchBrands(query, maxSize);
      const suggestions = brands.map(brand => ({
        text: brand.name,
        count: brand._count || 0
      }));

      res.json({
        query,
        suggestions
      });
    }
  });

  suggestCategories = asyncHandler(async (req: Request, res: Response) => {
    const { q: query, size = '10' } = req.query;

    if (!query || typeof query !== 'string' || query.length < 3) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Bad Request',
        message: 'Query parameter "q" is required and must be at least 3 characters long'
      });
    }

    const maxSize = Math.min(parseInt(size as string) || 10, 50);

    try {
      // Use Elasticsearch aggregation for category suggestions with counts
      const response = await elasticsearchClient.search({
        index: 'products',
          size: 0,
          query: {
            match: {
              'category.suggest': {
                query: query,
                operator: 'and'
              }
            }
          },
          aggs: {
            category_suggestions: {
              terms: {
                field: 'category.keyword',
                size: maxSize,
                order: { _count: 'desc' }
              }
            }
          }
      });

      const categoryAgg = response.aggregations?.category_suggestions as any;
      const suggestions = categoryAgg?.buckets?.map((bucket: any) => ({
        text: bucket.key,
        count: bucket.doc_count
      })) || [];

      res.json({
        query,
        suggestions
      });
    } catch (error) {
      console.error('Elasticsearch category suggestion failed:', error);
      
      // Fallback to database search
      const categories = await this.categoryRepository.searchCategories(query, maxSize);
      const suggestions = categories.map(category => ({
        text: category.name,
        count: category._count || 0
      }));

      res.json({
        query,
        suggestions
      });
    }
  });

  suggestTags = asyncHandler(async (req: Request, res: Response) => {
    const { q: query, size = '10' } = req.query;

    if (!query || typeof query !== 'string' || query.length < 3) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Bad Request',
        message: 'Query parameter "q" is required and must be at least 3 characters long'
      });
    }

    const maxSize = Math.min(parseInt(size as string) || 10, 50);

    try {
      // Use Elasticsearch aggregation for tag suggestions with counts
      const response = await elasticsearchClient.search({
        index: 'products',
          size: 0,
          query: {
            match: {
              'tags.suggest': {
                query: query,
                operator: 'and'
              }
            }
          },
          aggs: {
            tag_suggestions: {
              terms: {
                field: 'tags.keyword',
                size: maxSize,
                order: { _count: 'desc' }
              }
            }
          }
      });

      const tagAgg = response.aggregations?.tag_suggestions as any;
      const suggestions = tagAgg?.buckets?.map((bucket: any) => ({
        text: bucket.key,
        count: bucket.doc_count
      })) || [];

      res.json({
        query,
        suggestions
      });
    } catch (error) {
      console.error('Elasticsearch tag suggestion failed:', error);
      
      // Fallback to database search - tags require a join through ProductTag
      const suggestions = await prisma.tag.findMany({
        where: {
          name: {
            contains: query
          }
        },
        select: {
          name: true,
          _count: {
            select: {
              productTags: true
            }
          }
        },
        take: maxSize,
        orderBy: {
          productTags: {
            _count: 'desc'
          }
        }
      });

      const formattedSuggestions = suggestions.map(tag => ({
        text: tag.name,
        count: (tag as any)._count.productTags
      }));

      res.json({
        query,
        suggestions: formattedSuggestions
      });
    }
  });
}