'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Product } from '@shared/types';
import { 
  ArrowLeft, 
  Star, 
  Package, 
  Truck, 
  Shield, 
  RotateCcw, 
  Barcode,
  // Calendar,
  ShoppingCart,
  Heart,
  Share2
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (params?.id) {
      loadProduct();
    }
  }, [params?.id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProductById(Number(params?.id));
      if (response.data) {
        setProduct(response.data);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusStyle = (status: string, stock: number) => {
    if (stock === 0) return 'text-red-500';
    if (status === 'Low Stock') return 'text-orange-500';
    return 'text-green-600';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => router.push('/')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {images.length > 0 && (
            <>
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <img
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm rounded">
                    -{product.discountPercentage.toFixed(2)}% OFF
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border overflow-hidden ${
                        currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.category && (
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {product.category.name}
                </span>
              )}
              {product.brand && (
                <span className="text-sm text-gray-500">by {product.brand.name}</span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {renderStars(product.rating)}
                <span className="ml-2 text-sm font-medium">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price */}
          <div className="border-t border-b py-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                  Save ${(product.price - discountedPrice).toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`font-medium ${getStockStatusStyle(product.availabilityStatus, product.stock)}`}>
                {product.stock === 0 ? 'Out of Stock' : product.availabilityStatus}
                {product.stock > 0 && ` (${product.stock} available)`}
              </div>
              {product.minimumOrderQuantity > 1 && (
                <span className="text-sm text-gray-500">
                  Min. order: {product.minimumOrderQuantity}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              size="lg" 
              className="flex-1"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span key={index} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">SKU</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            {product.weight && (
              <div className="flex justify-between">
                <span className="text-gray-600">Weight</span>
                <span className="font-medium">{product.weight}g</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions</span>
                <span className="font-medium">
                  {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
                </span>
              </div>
            )}
            {product.barcode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Barcode</span>
                <span className="font-medium">{product.barcode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Added</span>
              <span className="font-medium">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Returns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping & Returns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.shippingInformation && (
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-gray-600">{product.shippingInformation}</p>
                </div>
              </div>
            )}
            {product.returnPolicy && (
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Returns</p>
                  <p className="text-sm text-gray-600">{product.returnPolicy}</p>
                </div>
              </div>
            )}
            {product.warrantyInformation && (
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Warranty</p>
                  <p className="text-sm text-gray-600">{product.warrantyInformation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code */}
        {product.qrCode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <img 
                  src={product.qrCode} 
                  alt="Product QR Code"
                  className="w-32 h-32 mx-auto"
                />
                <p className="text-sm text-gray-600 mt-2">Scan for quick access</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Customer Reviews ({product.reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.reviewer?.name || 'Anonymous'}</span>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}