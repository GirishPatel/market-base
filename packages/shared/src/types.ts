export interface User {
  id: string;
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

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  authorId: string;
  author?: User;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  summary?: string;
  published?: boolean;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  summary?: string;
  published?: boolean;
}

export interface SearchRequest {
  query: string;
  type?: 'users' | 'articles';
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