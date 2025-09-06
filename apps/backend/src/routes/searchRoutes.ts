import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { validateQuery } from '../middleware/validation';
import { searchSchema } from '@shared/types';

const router = Router();
const searchController = new SearchController();

router.get('/', validateQuery(searchSchema), searchController.search);

export default router;