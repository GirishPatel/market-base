import { PrismaClient } from '@prisma/client';
import { Product, CreateProductRequest, UpdateProductRequest } from '@shared/types';

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(limit?: number, offset?: number): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      take: limit,
      skip: offset,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        productTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return products.map(this.transformProduct);
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        productTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return product ? this.transformProduct(product) : null;
  }

  async findByCategory(categoryName: string, limit?: number, offset?: number): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          name: categoryName
        }
      },
      take: limit,
      skip: offset,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        productTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return products.map(this.transformProduct);
  }

  async create(data: CreateProductRequest): Promise<Product> {
    const { tags, ...productData } = data;
    
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        dimensions: data.dimensions ? data.dimensions as any : undefined,
        images: data.images ? data.images : undefined,
        productTags: tags ? {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        } : undefined
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        productTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return this.transformProduct(product);
  }

  async update(id: number, data: UpdateProductRequest): Promise<Product | null> {
    const { tags, ...updateData } = data;
    
    // Handle tags update if provided
    if (tags) {
      await this.prisma.productTag.deleteMany({
        where: { productId: id }
      });
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        dimensions: data.dimensions ? JSON.stringify(data.dimensions) : undefined,
        images: data.images ? JSON.stringify(data.images) : undefined,
        productTags: tags ? {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        } : undefined
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        productTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return this.transformProduct(product);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  private transformProduct(product: any): Product {
    const tags = product.productTags?.map((pt: any) => pt.tag.name) || [];
    
    return {
      id: product.id,
      categoryId: product.categoryId,
      brandId: product.brandId,
      sku: product.sku,
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      stock: product.stock,
      minimumOrderQuantity: product.minimumOrderQuantity,
      weight: product.weight,
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : undefined,
      warrantyInformation: product.warrantyInformation,
      shippingInformation: product.shippingInformation,
      availabilityStatus: product.availabilityStatus,
      returnPolicy: product.returnPolicy,
      barcode: product.barcode,
      qrCode: product.qrCode,
      images: product.images ? JSON.parse(product.images) : undefined,
      thumbnail: product.thumbnail,
      category: product.category,
      brand: product.brand,
      reviews: product.reviews?.map((review: any) => ({
        ...review,
        reviewer: review.reviewer
      })),
      tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      meta: {
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        barcode: product.barcode,
        qrCode: product.qrCode
      }
    };
  }
}