import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
});

export const createProductSchema = z.object({
  categoryId: z.number().min(1, 'Category ID is required'),
  brandId: z.number().min(1, 'Brand ID is required'),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  discountPercentage: z.number().min(0).max(100).optional().default(0),
  stock: z.number().min(0, 'Stock must be non-negative'),
  minimumOrderQuantity: z.number().min(1).optional().default(1),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    width: z.number().min(0),
    height: z.number().min(0),
    depth: z.number().min(0)
  }).optional(),
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  availabilityStatus: z.string().optional().default('In Stock'),
  returnPolicy: z.string().optional(),
  barcode: z.string().optional(),
  qrCode: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  thumbnail: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProductSchema = z.object({
  categoryId: z.number().min(1).optional(),
  brandId: z.number().min(1).optional(),
  sku: z.string().min(1).max(50).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  stock: z.number().min(0).optional(),
  minimumOrderQuantity: z.number().min(1).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    width: z.number().min(0),
    height: z.number().min(0),
    depth: z.number().min(0)
  }).optional(),
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  availabilityStatus: z.string().optional(),
  returnPolicy: z.string().optional(),
  barcode: z.string().optional(),
  qrCode: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  thumbnail: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').optional(),
  type: z.enum(['users', 'products']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const productSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const idParamSchema = z.object({
  id: z.coerce.number().min(1, 'Invalid ID format'),
});