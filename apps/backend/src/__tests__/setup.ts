import { beforeAll, afterAll } from '@jest/globals';

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Cleanup after tests
});