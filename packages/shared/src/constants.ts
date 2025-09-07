export const API_ROUTES = {
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  SEARCH: '/api/search',
  HEALTH: '/api/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const ELASTICSEARCH_INDICES = {
  USERS: 'users',
  PRODUCTS: 'products',
} as const;