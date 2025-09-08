import { ApiResponse, User, Product, Category, CreateUserRequest, CreateProductRequest, UpdateUserRequest, UpdateProductRequest, SearchResponse } from '@shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health
  async checkHealth() {
    return this.request<any>('/api/health');
  }

  // Users
  async getUsers(page = 1, limit = 10) {
    return this.request<{ users: User[]; total: number; page: number; limit: number }>(
      `/api/users?page=${page}&limit=${limit}`
    );
  }

  async getUserById(id: string) {
    return this.request<User>(`/api/users/${id}`);
  }

  async createUser(data: CreateUserRequest) {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserRequest) {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request<Category[]>('/api/categories');
  }

  // Tags
  async getTags() {
    return this.request<{ success: boolean; data: Array<{id: number, name: string}> }>('/api/tags');
  }

  async suggestTags(query: string, size = 10) {
    const params = new URLSearchParams({
      q: query,
      size: size.toString(),
    });
    return this.request<{ success: boolean; data: string[] }>(`/api/tags/suggest?${params}`);
  }

  // Brand suggestions
  async suggestBrands(query: string, size = 10): Promise<ApiResponse<{ query: string; suggestions: Array<{ text: string; count: number }> }>> {
    const urlParams = new URLSearchParams({ q: query, size: size.toString() });
    return this.request<{ query: string; suggestions: Array<{ text: string; count: number }> }>(`/api/brands/suggest?${urlParams}`);
  }

  // Get all brands
  async getAllBrands(size = 10): Promise<ApiResponse<{ brands: Array<{ id: number; name: string }> }>> {
    const urlParams = new URLSearchParams({ size: size.toString() });
    return this.request<{ brands: Array<{ id: number; name: string }> }>(`/api/brands?${urlParams}`);
  }


  // Products
  async getProducts(
    page = 1,
    limit = 10,
    filters: {
      category?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      maxRating?: number;
      availabilityStatus?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      query?: string;
    } = {}
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request<any>(
      `/api/products?${params}`
    );
  }

  async getProductById(id: number) {
    return this.request<Product>(`/api/products/${id}`);
  }

  async searchProducts(query: string, category?: string, page = 1, limit = 10) {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    });

    if (category) {
      params.append('category', category);
    }

    return this.request<{ products: Product[]; total: number; query: string; limit: number; offset: number }>(
      `/api/products?${params}`
    );
  }

  async createProduct(data: CreateProductRequest) {
    return this.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: UpdateProductRequest) {
    return this.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number) {
    return this.request<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Search
  async search(query: string, type?: 'users' | 'products', limit = 10, offset = 0) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    return this.request<SearchResponse<User | Product> | { users: SearchResponse<User>; products: SearchResponse<Product>; query: string; limit: number; offset: number }>(
      `/api/search?${params}`
    );
  }

}

export const apiClient = new ApiClient(API_BASE_URL);