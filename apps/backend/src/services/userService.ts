import { CreateUserRequest, UpdateUserRequest, SearchRequest, SearchResponse, User } from '@shared/types';
import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '@shared/types';
import elasticsearchClient from '../config/elasticsearch';
import { logger } from '../config/logger';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(page = 1, limit = 10): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userRepository.findAll(skip, limit),
      this.userRepository.count(),
    ]);

    return { users, total, page, limit };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const user = await this.userRepository.create(data);

    // Index in Elasticsearch
    try {
      await elasticsearchClient.index({
        index: 'users',
        id: user.id,
        body: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      logger.error('Failed to index user in Elasticsearch:', error);
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const updatedUser = await this.userRepository.update(id, data);

    // Update in Elasticsearch
    try {
      await elasticsearchClient.update({
        index: 'users',
        id: updatedUser.id,
        body: {
          doc: {
            name: updatedUser.name,
            updatedAt: updatedUser.updatedAt,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to update user in Elasticsearch:', error);
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    await this.userRepository.delete(id);

    // Remove from Elasticsearch
    try {
      await elasticsearchClient.delete({
        index: 'users',
        id,
      });
    } catch (error) {
      logger.error('Failed to delete user from Elasticsearch:', error);
    }
  }

  async searchUsers(request: SearchRequest): Promise<SearchResponse<User>> {
    const { query, limit = 10, offset = 0 } = request;

    try {
      // Try Elasticsearch search first
      const searchResponse = await elasticsearchClient.search({
        index: 'users',
        body: {
          query: {
            multi_match: {
              query,
              fields: ['name^2', 'email'],
              fuzziness: 'AUTO',
            },
          },
          from: offset,
          size: limit,
        },
      });

      const users = searchResponse.hits.hits.map((hit: any) => hit._source);
      return {
        data: users,
        total: typeof searchResponse.hits.total === 'number' 
          ? searchResponse.hits.total 
          : searchResponse.hits.total?.value || 0,
        limit,
        offset,
      };
    } catch (error) {
      logger.warn('Elasticsearch search failed, falling back to database search:', error);
      
      // Fallback to database search
      const users = await this.userRepository.search(query, offset, limit);
      return {
        data: users,
        total: users.length,
        limit,
        offset,
      };
    }
  }
}