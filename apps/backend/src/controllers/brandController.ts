import { Request, Response } from 'express';
import { BrandRepository } from '../repositories/brandRepository';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS } from '@shared/types';

export class BrandController {
  private brandRepository: BrandRepository;

  constructor() {
    this.brandRepository = new BrandRepository(prisma);
  }

  getAllBrands = asyncHandler(async (req: Request, res: Response) => {
    const { page_no = '1', page_size = '20' } = req.query;
    
    const pageNo = Math.max(1, parseInt(page_no as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(page_size as string) || 20));
    const offset = (pageNo - 1) * pageSize;

    const brands = await this.brandRepository.findAll(pageSize, offset);
    const total = await this.brandRepository.count();

    res.json({
      meta: {
        page_no: pageNo,
        page_size: pageSize,
        total
      },
      brands
    });
  });

  getBrandById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const brandId = parseInt(id);

    if (isNaN(brandId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Bad Request',
        message: 'Brand ID must be a number'
      });
    }

    const brand = await this.brandRepository.findById(brandId);
    
    if (!brand) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Not Found',
        message: `Brand with ID ${brandId} not found`
      });
    }

    res.json({
      success: true,
      data: brand
    });
  });

}