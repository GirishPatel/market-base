import { CreateArticleRequest, UpdateArticleRequest, SearchRequest, SearchResponse, Article } from '@shared/types';
import { ArticleRepository } from '../repositories/articleRepository';
import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '@shared/types';
import elasticsearchClient from '../config/elasticsearch';
import { logger } from '../config/logger';

export class ArticleService {
  private articleRepository: ArticleRepository;
  private userRepository: UserRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.userRepository = new UserRepository();
  }

  async getAllArticles(page = 1, limit = 10, publishedOnly = false) {
    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      this.articleRepository.findAll(skip, limit, publishedOnly),
      this.articleRepository.count(publishedOnly),
    ]);

    return { articles, total, page, limit };
  }

  async getArticleById(id: string): Promise<Article> {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND);
    }
    return article;
  }

  async getArticlesByAuthor(authorId: string, page = 1, limit = 10) {
    const author = await this.userRepository.findById(authorId);
    if (!author) {
      throw new AppError('Author not found', HTTP_STATUS.NOT_FOUND);
    }

    const skip = (page - 1) * limit;
    const articles = await this.articleRepository.findByAuthorId(authorId, skip, limit);
    
    return { articles, authorId, page, limit };
  }

  async createArticle(data: CreateArticleRequest, authorId: string): Promise<Article> {
    const author = await this.userRepository.findById(authorId);
    if (!author) {
      throw new AppError('Author not found', HTTP_STATUS.NOT_FOUND);
    }

    const article = await this.articleRepository.create({ ...data, authorId });

    // Index in Elasticsearch
    try {
      await elasticsearchClient.index({
        index: 'articles',
        id: article.id,
        body: {
          id: article.id,
          title: article.title,
          content: article.content,
          summary: article.summary,
          published: article.published,
          authorId: article.authorId,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
        },
      });
    } catch (error) {
      logger.error('Failed to index article in Elasticsearch:', error);
    }

    return article;
  }

  async updateArticle(id: string, data: UpdateArticleRequest): Promise<Article> {
    const existingArticle = await this.articleRepository.findById(id);
    if (!existingArticle) {
      throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND);
    }

    const updatedArticle = await this.articleRepository.update(id, data);

    // Update in Elasticsearch
    try {
      await elasticsearchClient.update({
        index: 'articles',
        id: updatedArticle.id,
        body: {
          doc: {
            title: updatedArticle.title,
            content: updatedArticle.content,
            summary: updatedArticle.summary,
            published: updatedArticle.published,
            updatedAt: updatedArticle.updatedAt,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to update article in Elasticsearch:', error);
    }

    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<void> {
    const existingArticle = await this.articleRepository.findById(id);
    if (!existingArticle) {
      throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND);
    }

    await this.articleRepository.delete(id);

    // Remove from Elasticsearch
    try {
      await elasticsearchClient.delete({
        index: 'articles',
        id,
      });
    } catch (error) {
      logger.error('Failed to delete article from Elasticsearch:', error);
    }
  }

  async searchArticles(request: SearchRequest): Promise<SearchResponse<Article>> {
    const { query, limit = 10, offset = 0 } = request;

    try {
      // Try Elasticsearch search first
      const searchResponse = await elasticsearchClient.search({
        index: 'articles',
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query,
                    fields: ['title^3', 'content', 'summary^2'],
                    fuzziness: 'AUTO',
                  },
                },
              ],
              filter: [
                { term: { published: true } }, // Only search published articles
              ],
            },
          },
          from: offset,
          size: limit,
          highlight: {
            fields: {
              title: {},
              content: { fragment_size: 150 },
              summary: {},
            },
          },
        },
      });

      const articles = searchResponse.hits.hits.map((hit: any) => ({
        ...hit._source,
        highlight: hit.highlight,
      }));

      return {
        data: articles,
        total: typeof searchResponse.hits.total === 'number' 
          ? searchResponse.hits.total 
          : searchResponse.hits.total?.value || 0,
        limit,
        offset,
      };
    } catch (error) {
      logger.warn('Elasticsearch search failed, falling back to database search:', error);
      
      // Fallback to database search
      const articles = await this.articleRepository.search(query, offset, limit, true);
      return {
        data: articles,
        total: articles.length,
        limit,
        offset,
      };
    }
  }
}