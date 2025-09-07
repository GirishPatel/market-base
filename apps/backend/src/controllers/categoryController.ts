import { Request, Response } from 'express';
import { CategoryRepository } from '../repositories/categoryRepository';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS } from '@shared/types';

export class CategoryController {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository(prisma);
  }

  getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const { page_no = '1', page_size = '20' } = req.query;
    
    const pageNo = Math.max(1, parseInt(page_no as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(page_size as string) || 20));
    const offset = (pageNo - 1) * pageSize;

    const categories = await this.categoryRepository.findAll(pageSize, offset);
    const total = await this.categoryRepository.count();

    res.json({
      meta: {
        page_no: pageNo,
        page_size: pageSize,
        total
      },
      categories
    });
  });

  getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Bad Request',
        message: 'Category ID must be a number'
      });
    }

    const category = await this.categoryRepository.findById(categoryId);
    
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Not Found',
        message: `Category with ID ${categoryId} not found`
      });
    }

    res.json({
      success: true,
      data: category
    });
  });

}