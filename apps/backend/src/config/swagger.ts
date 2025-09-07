import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'E-commerce platform API with products, categories, and search functionality',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
        Brand: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            categoryId: { type: 'integer' },
            brandId: { type: 'integer' },
            sku: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            discountPercentage: { type: 'number' },
            rating: { type: 'number' },
            stock: { type: 'integer' },
            minimumOrderQuantity: { type: 'integer' },
            weight: { type: 'number' },
            dimensions: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' },
                depth: { type: 'number' },
              },
            },
            warrantyInformation: { type: 'string' },
            shippingInformation: { type: 'string' },
            availabilityStatus: { type: 'string' },
            returnPolicy: { type: 'string' },
            barcode: { type: 'string' },
            qrCode: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            thumbnail: { type: 'string' },
            category: { $ref: '#/components/schemas/Category' },
            brand: { $ref: '#/components/schemas/Brand' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['categoryId', 'brandId', 'sku', 'title', 'description', 'price', 'stock'],
          properties: {
            categoryId: { type: 'integer' },
            brandId: { type: 'integer' },
            sku: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            discountPercentage: { type: 'number' },
            stock: { type: 'integer' },
            minimumOrderQuantity: { type: 'integer' },
            weight: { type: 'number' },
            dimensions: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' },
                depth: { type: 'number' },
              },
            },
            warrantyInformation: { type: 'string' },
            shippingInformation: { type: 'string' },
            availabilityStatus: { type: 'string' },
            returnPolicy: { type: 'string' },
            barcode: { type: 'string' },
            qrCode: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            thumbnail: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {},
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);