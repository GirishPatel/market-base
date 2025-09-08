export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface UpdateUserRequest {
  name?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Review {
  id: number;
  productId: number;
  rating: number;
  comment: string;
  date: Date;
  reviewerId: number;
  reviewer?: User;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductMeta {
  createdAt: Date;
  updatedAt: Date;
  barcode?: string;
  qrCode?: string;
}

export interface Product {
  id: number;
  categoryId: number;
  brandId: number;
  sku: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  minimumOrderQuantity: number;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus: string;
  returnPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
  barcode?: string;
  qrCode?: string;
  images?: string[];
  thumbnail?: string;
  category?: Category;
  brand?: Brand;
  reviews?: Review[];
  tags?: string[];
  meta?: ProductMeta;
}

export interface CreateProductRequest {
  categoryId: number;
  brandId: number;
  sku: string;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  stock: number;
  minimumOrderQuantity?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  barcode?: string;
  qrCode?: string;
  images?: string[];
  thumbnail?: string;
  tags?: string[];
}

export interface UpdateProductRequest {
  categoryId?: number;
  brandId?: number;
  sku?: string;
  title?: string;
  description?: string;
  price?: number;
  discountPercentage?: number;
  stock?: number;
  minimumOrderQuantity?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  barcode?: string;
  qrCode?: string;
  images?: string[];
  thumbnail?: string;
  tags?: string[];
}

export interface ProductsResponse {
  products: Product[];
  meta?: {
    page_no?: number;
    page_size?: number;
    total?: number;
  };
  filters?: {
    brands?: any[];
    categories?: any[];
    tags?: any[];
  };
}

export interface SearchRequest {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}