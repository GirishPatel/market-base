import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ArticleService } from '../services/articleService';
import { HTTP_STATUS } from '@shared/types';
import { asyncHandler } from '../middleware/errorHandler';

export class SearchController {
  private userService: UserService;
  private articleService: ArticleService;

  constructor() {
    this.userService = new UserService();
    this.articleService = new ArticleService();
  }

  /**
   * @swagger
   * /api/search:
   *   get:
   *     summary: Search across users and articles
   *     tags: [Search]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [users, articles]
   *         description: Type of content to search
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Number of results to return
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *         description: Number of results to skip
   *     responses:
   *       200:
   *         description: Search results
   *       400:
   *         description: Missing or invalid search query
   */
  search = asyncHandler(async (req: Request, res: Response) => {
    const { q: query, type, limit = 10, offset = 0 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Bad Request',
        message: 'Search query is required',
      });
    }

    const searchLimit = Math.min(parseInt(limit as string) || 10, 100);
    const searchOffset = Math.max(parseInt(offset as string) || 0, 0);

    const searchRequest = {
      query,
      type: type as 'users' | 'articles' | undefined,
      limit: searchLimit,
      offset: searchOffset,
    };

    let results;

    if (type === 'users') {
      results = await this.userService.searchUsers(searchRequest);
    } else if (type === 'articles') {
      results = await this.articleService.searchArticles(searchRequest);
    } else {
      // Search both users and articles
      const [userResults, articleResults] = await Promise.all([
        this.userService.searchUsers({ ...searchRequest, limit: Math.floor(searchLimit / 2) }),
        this.articleService.searchArticles({ ...searchRequest, limit: Math.ceil(searchLimit / 2) }),
      ]);

      results = {
        users: userResults,
        articles: articleResults,
        query,
        limit: searchLimit,
        offset: searchOffset,
      };
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: results,
    });
  });
}