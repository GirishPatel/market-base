import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { CreateProductRequest, UpdateProductRequest, SearchRequest } from '@shared/types';

export class ProductController {
  constructor(private productService: ProductService) {}

  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        q: query,
        brand,
        category,
        tags,
        minPrice,
        maxPrice,
        minRating,
        min_discount,
        max_discount,
        in_stock,
        sort,
        order,
        page = '1',
        limit = '10'
      } = req.query;

      // Parse pagination
      const pageNo = Math.max(1, parseInt(page as string) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
      const offset = (pageNo - 1) * pageSize;

      // Parse filters - handle both single and multiple values
      const filters = {
        query: query as string,
        brands: brand ? (Array.isArray(brand) ? brand as string[] : [brand as string]) : undefined,
        categories: category ? (Array.isArray(category) ? category as string[] : [category as string]) : undefined,
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        minDiscount: min_discount ? parseFloat(min_discount as string) : undefined,
        maxDiscount: max_discount ? parseFloat(max_discount as string) : undefined,
        inStock: in_stock === 'true' ? true : undefined,
        sort: sort as string,
        order: (order as string) || 'desc',
        limit: pageSize,
        offset
      };

      const result = await this.productService.searchProductsAdvanced(filters);
      
      // Format response with meta and filters
      const response = {
        meta: {
          page_no: pageNo,
          page_size: pageSize,
          total: result.total || 0
        },
        filters: {
          brands: filters.brands || [],
          categories: filters.categories || [],
          tags: filters.tags || []
        },
        products: result.products
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get products',
        message: 'An error occurred while retrieving products' 
      });
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid product ID',
          message: 'Product ID must be a number' 
        });
        return;
      }

      const product = await this.productService.getProductById(productId);
      
      if (!product) {
        res.status(404).json({ 
          success: false, 
          error: 'Product not found',
          message: `Product with ID ${productId} not found` 
        });
        return;
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error getting product by ID:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get product',
        message: 'An error occurred while retrieving the product' 
      });
    }
  };


  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const productData: CreateProductRequest = req.body;
      const product = await this.productService.createProduct(productData);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create product',
        message: 'An error occurred while creating the product' 
      });
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid product ID',
          message: 'Product ID must be a number' 
        });
        return;
      }

      const updateData: UpdateProductRequest = req.body;
      const product = await this.productService.updateProduct(productId, updateData);
      
      if (!product) {
        res.status(404).json({ 
          success: false, 
          error: 'Product not found',
          message: `Product with ID ${productId} not found` 
        });
        return;
      }

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update product',
        message: 'An error occurred while updating the product' 
      });
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid product ID',
          message: 'Product ID must be a number' 
        });
        return;
      }

      const success = await this.productService.deleteProduct(productId);
      
      if (!success) {
        res.status(404).json({ 
          success: false, 
          error: 'Product not found',
          message: `Product with ID ${productId} not found` 
        });
        return;
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete product',
        message: 'An error occurred while deleting the product' 
      });
    }
  };



}