import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { AutosuggestController } from '../controllers/autosuggestController';

const router = Router();
const categoryController = new CategoryController();
const autosuggestController = new AutosuggestController();

/**
 * @swagger
 * /api/categories/suggest:
 *   get:
 *     summary: Get category autosuggestions
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for category suggestions
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Number of suggestions to return
 *     responses:
 *       200:
 *         description: Category suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request - missing query parameter
 *       500:
 *         description: Server error
 */
router.get('/suggest', autosuggestController.suggestCategories);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories with pagination
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Server error
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/:id', categoryController.getCategoryById);


export default router;