import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { ProductService } from '../src/services/productService';
import { ProductRepository } from '../src/repositories/productRepository';
import { CategoryRepository } from '../src/repositories/categoryRepository';
import { BrandRepository } from '../src/repositories/brandRepository';
import { elasticsearchClient } from '../src/config/elasticsearch';

const prisma = new PrismaClient();

interface ProductData {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }>;
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

interface ProductsFile {
  products: ProductData[];
}

async function main() {
  console.log('🌱 Starting e-commerce seed...');

  // Read products data from JSON file
  const productsFilePath = path.join(process.cwd(), '../../data/products.json');

  // Check if products.json exists
  if (!fs.existsSync(productsFilePath)) {
    console.error(`❌ Products data file not found at: ${productsFilePath}`);
    console.log('Please ensure the data/products.json file exists');
    return;
  }

  const productsData: ProductsFile = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

  console.log(`📦 Found ${productsData.products.length} products to seed`);

  // Extract all unique reviewers from products data
  const allReviewers = new Map<string, { email: string; name: string }>();

  productsData.products.forEach(product => {
    product.reviews.forEach(review => {
      if (!allReviewers.has(review.reviewerEmail)) {
        allReviewers.set(review.reviewerEmail, {
          email: review.reviewerEmail,
          name: review.reviewerName
        });
      }
    });
  });

  console.log(`👥 Found ${allReviewers.size} unique reviewers to create`);

  // Initialize Elasticsearch
  console.log('🔍 Setting up Elasticsearch connection...');
  try {
    const health = await elasticsearchClient.cluster.health();
    console.log('✅ Elasticsearch connected:', health.status);

    // Ensure proper index creation with mappings
    const { setupElasticsearch } = await import('../src/config/elasticsearch');
    await setupElasticsearch();
    console.log('✅ Elasticsearch index setup completed');
  } catch (error) {
    console.error('❌ Elasticsearch connection failed:', error);
    console.log('⚠️ Continuing with database-only seeding...');
  }

  // Prepare bulk ES operations
  const esOperations: any[] = [];

  // Create or get users for all reviewers
  const users = await Promise.all(
    Array.from(allReviewers.values()).map(async (reviewer) => {
      let existingUser = await prisma.user.findUnique({
        where: { email: reviewer.email },
      });

      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: reviewer,
        });
        console.log(`✅ Created user: ${reviewer.name}`);
      }

      return existingUser;
    })
  );

  // Create a map for faster user lookup by email
  const userMap = new Map(users.map(user => [user.email, user]));

  // Process each product
  for (const productData of productsData.products) {
    try {
      // Create or get category - handle missing category names
      const categoryName = productData.category || 'Uncategorized';
      let category = await prisma.category.findUnique({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName },
        });
      }

      // Create or get brand - handle missing brand names
      const brandName = productData.brand;
      if (brandName) {
        let brand = await prisma.brand.findUnique({
          where: { name: brandName },
        });

        if (!brand) {
          brand = await prisma.brand.create({
            data: { name: brandName },
          });
        }
      }

      // Create or get product
      let product = await prisma.product.findUnique({
        where: { sku: productData.sku },
        include: {
          category: true,
          brand: true,
          reviews: true,
          productTags: {
            include: {
              tag: true
            }
          }
        }
      });

      if (!product) {
        product = await prisma.product.create({
          data: {
            sku: productData.sku,
            title: productData.title,
            description: productData.description,
            price: productData.price,
            discountPercentage: productData.discountPercentage,
            rating: productData.rating,
            stock: productData.stock,
            minimumOrderQuantity: productData.minimumOrderQuantity,
            weight: productData.weight,
            dimensions: JSON.stringify(productData.dimensions),
            warrantyInformation: productData.warrantyInformation,
            shippingInformation: productData.shippingInformation,
            availabilityStatus: productData.availabilityStatus,
            returnPolicy: productData.returnPolicy,
            barcode: productData.meta.barcode,
            qrCode: productData.meta.qrCode,
            images: JSON.stringify(productData.images),
            thumbnail: productData.thumbnail,
            categoryId: category.id,
            brandId: brand.id,
          },
          include: {
            category: true,
            brand: true,
            reviews: true,
            productTags: {
              include: {
                tag: true
              }
            }
          }
        });
        console.log(`✅ Created new product: ${product.title}`);
      } else {
        console.log(`⏭️ Product already exists: ${product.title} (SKU: ${product.sku})`);
      }

      // Create tags and link them to product - handle missing or empty tags
      const tags = productData.tags || [];
      for (const tagName of tags) {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          });
        }

        // Check if ProductTag already exists
        const existingProductTag = await prisma.productTag.findFirst({
          where: {
            productId: product.id,
            tagId: tag.id,
          },
        });

        if (!existingProductTag) {
          await prisma.productTag.create({
            data: {
              productId: product.id,
              tagId: tag.id,
            },
          });
          console.log(`✅ Linked tag "${tagName}" to product: ${product.title}`);
        } else {
          console.log(`⏭️ Tag "${tagName}" already linked to product: ${product.title}`);
        }
      }

      // Create reviews
      for (const reviewData of productData.reviews) {
        const reviewer = userMap.get(reviewData.reviewerEmail);

        if (!reviewer) {
          console.error(`⚠️ Reviewer not found: ${reviewData.reviewerEmail} for product ${productData.title}`);
          continue;
        }

        // Check if review already exists (by reviewer, product, and comment to avoid exact duplicates)
        const existingReview = await prisma.review.findFirst({
          where: {
            productId: product.id,
            reviewerId: reviewer.id,
            comment: reviewData.comment,
          },
        });

        if (!existingReview) {
          await prisma.review.create({
            data: {
              productId: product.id,
              rating: reviewData.rating,
              comment: reviewData.comment,
              date: new Date(reviewData.date),
              reviewerId: reviewer.id,
            },
          });
          console.log(`✅ Created review by ${reviewData.reviewerName} for ${productData.title}`);
        } else {
          console.log(`⏭️ Review already exists by ${reviewData.reviewerName} for ${productData.title}`);
        }
      }

      // Only process ES operations for valid products
      if (product) {
        // Add to ES bulk operations
        esOperations.push(
          { index: { _index: 'products', _id: product.id.toString() } },
          {
            id: product.id,
            title: productData.title,
            description: productData.description,
            category: categoryName,
            brand: brandName,
            tags: tags,
            price: productData.price,
            stock: productData.stock,
            rating: productData.rating,
            availabilityStatus: productData.availabilityStatus,
            review_count: productData.reviews.length,
            discountPercentage: productData.discountPercentage,
            thumbnail: productData.thumbnail,
            createdAt: new Date(productData.meta.createdAt),
            updatedAt: new Date(productData.meta.updatedAt),
          }
        );
      }
    } catch (error) {
      console.error(`❌ Failed to seed product ${productData.title}:`, error);
    }
  }

  // Bulk index to Elasticsearch
  if (esOperations.length > 0) {
    console.log(`🔍 Bulk indexing ${esOperations.length / 2} products to Elasticsearch...`);
    try {
      const response = await elasticsearchClient.bulk({ body: esOperations });

      if (response.errors) {
        console.error('⚠️ Some Elasticsearch indexing errors occurred:', response.items.filter((item: any) => item.index?.error));
      } else {
        console.log('✅ All products indexed to Elasticsearch successfully');
      }
    } catch (error) {
      console.error('❌ Failed to bulk index to Elasticsearch:', error);
    }
  } else {
    console.log('⚠️ No products to index to Elasticsearch');
  }

  // Print summary statistics
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalBrands = await prisma.brand.count();
  const totalTags = await prisma.tag.count();
  const totalReviews = await prisma.review.count();
  const totalUsers = await prisma.user.count();

  console.log('\n📊 Seeding Summary:');
  console.log(`   👥 Users: ${totalUsers}`);
  console.log(`   📦 Products: ${totalProducts}`);
  console.log(`   🏷️  Categories: ${totalCategories}`);
  console.log(`   🏢 Brands: ${totalBrands}`);
  console.log(`   🔖 Tags: ${totalTags}`);
  console.log(`   ⭐ Reviews: ${totalReviews}`);
  console.log(`   🔍 Elasticsearch: ${esOperations.length / 2} products indexed`);

  console.log('\n✅ E-commerce seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });