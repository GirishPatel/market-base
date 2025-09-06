import { ApiResponse, User, Article, CreateUserRequest, CreateArticleRequest, UpdateUserRequest, UpdateArticleRequest, SearchRequest, SearchResponse } from '@shared/types';

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

  // Articles
  async getArticles(page = 1, limit = 10, published?: boolean) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (published !== undefined) {
      params.append('published', published.toString());
    }

    return this.request<{ articles: Article[]; total: number; page: number; limit: number }>(
      `/api/articles?${params}`
    );
  }

  async getArticleById(id: string) {
    return this.request<Article>(`/api/articles/${id}`);
  }

  async getArticlesByAuthor(authorId: string, page = 1, limit = 10) {
    return this.request<{ articles: Article[]; authorId: string; page: number; limit: number }>(
      `/api/articles/author/${authorId}?page=${page}&limit=${limit}`
    );
  }

  async createArticle(data: CreateArticleRequest & { authorId: string }) {
    return this.request<Article>('/api/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: string, data: UpdateArticleRequest) {
    return this.request<Article>(`/api/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: string) {
    return this.request<void>(`/api/articles/${id}`, {
      method: 'DELETE',
    });
  }

  // Search
  async search(query: string, type?: 'users' | 'articles', limit = 10, offset = 0) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    return this.request<SearchResponse<User | Article> | { users: SearchResponse<User>; articles: SearchResponse<Article>; query: string; limit: number; offset: number }>(
      `/api/search?${params}`
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);