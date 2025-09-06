import { Request, Response } from 'express';
import { ArticleService } from '../services/articleService';
import { HTTP_STATUS } from '@shared/types';
import { asyncHandler } from '../middleware/errorHandler';

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  /**
   * @swagger
   * /api/articles:
   *   get:
   *     summary: Get all articles
   *     tags: [Articles]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Number of items per page
   *       - in: query
   *         name: published
   *         schema:
   *           type: boolean
   *         description: Filter by published status
   *     responses:
   *       200:
   *         description: Success
   */
  getArticles = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const publishedOnly = req.query.published === 'true';

    const result = await this.articleService.getAllArticles(page, limit, publishedOnly);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  });

  /**
   * @swagger
   * /api/articles/{id}:
   *   get:
   *     summary: Get article by ID
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Article not found
   */
  getArticleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await this.articleService.getArticleById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: article,
    });
  });

  /**
   * @swagger
   * /api/articles/author/{authorId}:
   *   get:
   *     summary: Get articles by author
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: authorId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Author not found
   */
  getArticlesByAuthor = asyncHandler(async (req: Request, res: Response) => {
    const { authorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.articleService.getArticlesByAuthor(authorId, page, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  });

  /**
   * @swagger
   * /api/articles:
   *   post:
   *     summary: Create a new article
   *     tags: [Articles]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             allOf:
   *               - $ref: '#/components/schemas/CreateArticleRequest'
   *               - type: object
   *                 required: [authorId]
   *                 properties:
   *                   authorId:
   *                     type: string
   *                     format: uuid
   *     responses:
   *       201:
   *         description: Article created successfully
   *       404:
   *         description: Author not found
   */
  createArticle = asyncHandler(async (req: Request, res: Response) => {
    const { authorId, ...articleData } = req.body;
    const article = await this.articleService.createArticle(articleData, authorId);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: article,
      message: 'Article created successfully',
    });
  });

  /**
   * @swagger
   * /api/articles/{id}:
   *   put:
   *     summary: Update article
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               summary:
   *                 type: string
   *               published:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Article updated successfully
   *       404:
   *         description: Article not found
   */
  updateArticle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await this.articleService.updateArticle(id, req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: article,
      message: 'Article updated successfully',
    });
  });

  /**
   * @swagger
   * /api/articles/{id}:
   *   delete:
   *     summary: Delete article
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Article deleted successfully
   *       404:
   *         description: Article not found
   */
  deleteArticle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.articleService.deleteArticle(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Article deleted successfully',
    });
  });
}