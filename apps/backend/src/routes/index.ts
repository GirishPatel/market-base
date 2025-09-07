import { Router } from 'express';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import brandRoutes from './brandRoutes';
import tagRoutes from './tagRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/tags', tagRoutes);

export default router;