import { Router } from 'express';
import { AutosuggestController } from '../controllers/autosuggestController';

const router = Router();
const autosuggestController = new AutosuggestController();

/**
 * @swagger
 * /api/tags/suggest:
 *   get:
 *     summary: Get tag autosuggestions
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for tag suggestions
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
 *         description: Tag suggestions
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
router.get('/suggest', autosuggestController.suggestTags);

export default router;