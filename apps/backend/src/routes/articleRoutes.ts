import { Router } from 'express';
import { ArticleController } from '../controllers/articleController';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { createArticleSchema, updateArticleSchema, idParamSchema, paginationSchema } from '@shared/types';

const router = Router();
const articleController = new ArticleController();

router.get('/', validateQuery(paginationSchema), articleController.getArticles);
router.get('/:id', validateParams(idParamSchema), articleController.getArticleById);
router.get('/author/:authorId', validateParams(idParamSchema.extend({ authorId: idParamSchema.shape.id })), validateQuery(paginationSchema), articleController.getArticlesByAuthor);
router.post('/', validateBody(createArticleSchema.extend({ authorId: idParamSchema.shape.id })), articleController.createArticle);
router.put('/:id', validateParams(idParamSchema), validateBody(updateArticleSchema), articleController.updateArticle);
router.delete('/:id', validateParams(idParamSchema), articleController.deleteArticle);

export default router;