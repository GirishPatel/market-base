import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { swaggerSpec } from './config/swagger';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { defaultRateLimiter } from './middleware/rateLimiter';
import routes from './routes';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Swagger UI
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || /^http:\/\/localhost:\d+$/,
  credentials: true,
}));

// Compression and parsing middleware
app.use(compression() as any);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Rate limiting
app.use('/api', defaultRateLimiter);

// API Documentation
app.use('/api/docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}) as any);

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MarketBase API is running',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;