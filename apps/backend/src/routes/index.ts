import { Router } from 'express';
import userRoutes from './userRoutes';
import articleRoutes from './articleRoutes';
import searchRoutes from './searchRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
router.use('/search', searchRoutes);

export default router;