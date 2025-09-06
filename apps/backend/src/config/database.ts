import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Query logging disabled for now due to TypeScript compatibility issues
// prisma.$on('query', (e: any) => {
//   logger.debug('Query: ' + e.query);
//   logger.debug('Params: ' + e.params);
//   logger.debug('Duration: ' + e.duration + 'ms');
// });

export default prisma;