import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
});

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  summary: z.string().max(500, 'Summary too long').optional(),
  published: z.boolean().optional().default(false),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  summary: z.string().max(500, 'Summary too long').optional(),
  published: z.boolean().optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['users', 'articles']).optional(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});