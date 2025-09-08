import { Client } from '@elastic/elasticsearch';
import { Product, CreateProductRequest, UpdateProductRequest, SearchRequest, ProductsResponse } from '@shared/types';
import { ProductRepository } from '../repositories/productRepository';
import { CategoryRepository } from '../repositories/categoryRepository';
import { BrandRepository } from '../repositories/brandRepository';
import { PRODUCT_INDEX_MAPPINGS } from '../config/elasticsearchMappings';

export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository,
    private brandRepository: BrandRepository,
    private elasticsearchClient: Client
  ) {}

  async getAllProducts(limit?: number, offset?: number): Promise<ProductsResponse> {
    const products = await this.productRepository.findAll(limit, offset);
    return { products };
  }

  async getProductById(id: number): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async getProductsByCategory(categoryName: string, limit?: number, offset?: number): Promise<ProductsResponse> {
    const products = await this.productRepository.findByCategory(categoryName, limit, offset);
    return { products };
  }

  async searchProductsAdvanced(filters: any): Promise<ProductsResponse & { total?: number }> {
    const {
      query,
      brands,
      categories,
      tags,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      maxDiscount,
      inStock,
      sort,
      order,
      limit,
      offset
    } = filters;

    try {
      // Build Elasticsearch query
      const must: any[] = [];
      const filter: any[] = [];

      // Text search
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['title^3', 'description^2', 'brand', 'category', 'tags'],
            fuzziness: 'AUTO'
          }
        });
      }

      // Filters
      if (brands && brands.length > 0) {
        filter.push({ terms: { 'brand.keyword': brands } });
      }
      if (categories && categories.length > 0) {
        filter.push({ terms: { 'category.keyword': categories } });
      }
      if (tags && tags.length > 0) {
        filter.push({ terms: { 'tags.keyword': tags } });
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        const range: any = {};
        if (minPrice !== undefined) range.gte = minPrice;
        if (maxPrice !== undefined) range.lte = maxPrice;
        filter.push({ range: { price: range } });
      }
      if (minRating !== undefined) {
        filter.push({ range: { rating: { gte: minRating } } });
      }
      if (minDiscount !== undefined || maxDiscount !== undefined) {
        const range: any = {};
        if (minDiscount !== undefined) range.gte = minDiscount;
        if (maxDiscount !== undefined) range.lte = maxDiscount;
        filter.push({ range: { discountPercentage: range } });
      }
      if (inStock) {
        filter.push({ range: { stock: { gt: 0 } } });
      }

      // Sorting
      let sortConfig: any[] = [];
      if (sort) {
        const sortField = sort === 'newest' ? 'createdAt' : sort === 'discount' ? 'discountPercentage' : sort;
        const sortOrder = order === 'asc' ? 'asc' : 'desc';
        sortConfig.push({ [sortField]: { order: sortOrder } });
      } else {
        sortConfig.push({ _score: { order: 'desc' } });
      }

      const searchBody = {
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter: filter.length > 0 ? filter : undefined
          }
        },
        sort: sortConfig,
        from: offset,
        size: limit
      };

      console.log('searchBody', JSON.stringify(searchBody));
      const response = await this.elasticsearchClient.search({
        index: 'products',
        body: searchBody
      });

      const products = response.hits.hits.map((hit: any) => hit._source);
      
      if (products.length === 0) {
        return { products: [], total: response.hits.total?.value || 0 };
      }

      // // Get full product details from database
      // const products = await Promise.all(
      //   productIds.map((id: number) => this.productRepository.findById(id))
      // );

      // const validProducts = products.filter((product: Product | null): product is Product => product !== null);
      
      return { 
        products: products, 
        total: response.hits.total?.value || 0 
      };
    } catch (error) {
      console.error('Elasticsearch advanced search failed:', error);
      
      // Fallback to database search with basic filtering
      const dbProducts = await this.productRepository.findAll(limit, offset);
      return { products: dbProducts };
    }
  }

  async searchProducts(searchRequest: SearchRequest): Promise<ProductsResponse> {
    const { query, category, limit = 20, offset = 0 } = searchRequest;

    if (query) {
      // Full-text search using Elasticsearch
      return await this.searchProductsInElasticsearch(query, category, limit, offset);
    } else if (category) {
      // Filter by category using database
      const products = await this.productRepository.findByCategory(category, limit, offset);
      return { products };
    } else {
      // Get all products
      const products = await this.productRepository.findAll(limit, offset);
      return { products };
    }
  }

  private async searchProductsInElasticsearch(
    query: string, 
    category?: string, 
    limit = 20, 
    offset = 0
  ): Promise<ProductsResponse> {
    try {
      const searchBody: any = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['title^3', 'description^2', 'brand', 'category', 'tags'],
                  fuzziness: 'AUTO'
                }
              }
            ]
          }
        },
        from: offset,
        size: limit
      };

      if (category) {
        searchBody.query.bool.filter = [
          { term: { category: category } }
        ];
      }

      const response = await this.elasticsearchClient.search({
        index: 'products',
        body: searchBody
      });

      const productIds = response.hits.hits.map((hit: any) => hit._source.id);
      
      if (productIds.length === 0) {
        return { products: [] };
      }

      // Get full product details from database
      const products = await Promise.all(
        productIds.map((id: number) => this.productRepository.findById(id))
      );

      const validProducts = products.filter((product: Product | null): product is Product => product !== null);
      return { products: validProducts };
    } catch (error) {
      console.error('Elasticsearch search failed:', error);
      
      // Fallback to database search
      if (category) {
        const products = await this.productRepository.findByCategory(category, limit, offset);
        return { products };
      } else {
        const products = await this.productRepository.findAll(limit, offset);
        return { products };
      }
    }
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const product = await this.productRepository.create(data);
    
    // Index in Elasticsearch
    try {
      await this.indexProductInElasticsearch(product);
    } catch (error) {
      console.error('Failed to index product in Elasticsearch:', error);
    }

    return product;
  }

  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product | null> {
    const product = await this.productRepository.update(id, data);
    
    if (product) {
      // Update in Elasticsearch
      try {
        await this.indexProductInElasticsearch(product);
      } catch (error) {
        console.error('Failed to update product in Elasticsearch:', error);
      }
    }

    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const success = await this.productRepository.delete(id);
    
    if (success) {
      // Remove from Elasticsearch
      try {
        await this.elasticsearchClient.delete({
          index: 'products',
          id: id.toString()
        });
      } catch (error) {
        console.error('Failed to delete product from Elasticsearch:', error);
      }
    }

    return success;
  }

  private async indexProductInElasticsearch(product: Product): Promise<void> {
    const doc = {
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category?.name || '',
      brand: product.brand?.name || '',
      tags: product.tags || [],
      price: product.price,
      stock: product.stock,
      rating: product.rating,
      discountPercentage: product.discountPercentage || 0,
      availabilityStatus: product.availabilityStatus
    };

    await this.elasticsearchClient.index({
      index: 'products',
      id: product.id.toString(),
      body: doc
    });
  }

  // currently used, but can be used to expose a sync API to sync the database with the elasticsearch index
  async initializeElasticsearchIndex(): Promise<void> {
    try {
      // Check if index exists
      const indexExists = await this.elasticsearchClient.indices.exists({
        index: 'products'
      });

      if (!indexExists) {
        // Create index with mapping
        await this.elasticsearchClient.indices.create({
          index: 'products',
          body: PRODUCT_INDEX_MAPPINGS,
        });
      }

      // Index all existing products
      const allProducts = await this.productRepository.findAll();
      
      if (allProducts.length > 0) {
        const body = allProducts.flatMap(product => [
          { index: { _index: 'products', _id: product.id.toString() } },
          {
            id: product.id,
            title: product.title,
            description: product.description,
            category: product.category?.name || '',
            brand: product.brand?.name || '',
            tags: product.tags || [],
            price: product.price,
            stock: product.stock,
            rating: product.rating,
            discountPercentage: product.discountPercentage || 0,
            availabilityStatus: product.availabilityStatus
          }
        ]);

        await this.elasticsearchClient.bulk({ body });
      }
    } catch (error) {
      console.error('Failed to initialize Elasticsearch index:', error);
    }
  }



}