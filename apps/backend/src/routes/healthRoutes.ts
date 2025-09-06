import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import elasticsearchClient from '../config/elasticsearch';
import { HTTP_STATUS } from '@shared/types';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Elasticsearch connection
    let elasticsearchStatus = 'healthy';
    try {
      await elasticsearchClient.ping();
    } catch (error) {
      elasticsearchStatus = 'unhealthy';
    }

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'healthy',
        elasticsearch: elasticsearchStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    const statusCode = elasticsearchStatus === 'healthy' 
      ? HTTP_STATUS.OK 
      : HTTP_STATUS.OK; // Still return 200 as the main service is working

    res.status(statusCode).json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'unhealthy',
          elasticsearch: 'unknown',
        },
      },
    });
  }
});

export default router;