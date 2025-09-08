'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Product, Category } from '@shared/types';
import { Search, Filter, Star, Package, ShoppingCart, Menu, X } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    brand: '',
    tags: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    minDiscount: '',
    sortBy: 'newest',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [brandInputValue, setBrandInputValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  useEffect(() => {
    // Only search if query is empty or has 3+ characters
    if (!filters.query || filters.query.length >= 3) {
      loadProducts();
    }
  }, [currentPage, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filterParams = {
        category: filters.category || undefined,
        brand: filters.brand || undefined,
        tags: filters.tags || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        min_discount: filters.minDiscount ? Number(filters.minDiscount) : undefined,
        q: filters.query || undefined,
        sort: filters.sortBy,
        order: filters.sortOrder
      };

      // Add minRating if set
      if (filters.minRating) {
        (filterParams as any).minRating = Number(filters.minRating);
      }

      const response = await apiClient.getProducts(currentPage, 12, filterParams);
      // Handle the actual API response structure
      if (response.data?.products) {
        setProducts(response.data.products);
        setTotalProducts(response.data.meta?.total || response.data.products.length);
      } else if (response.products) {
        // Handle direct response structure
        setProducts(response.products);
        setTotalProducts(response.meta?.total || response.products.length);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      // Handle the actual API response structure
      if (response.data?.categories) {
        setCategories(response.data.categories);
      } else if (response.categories) {
        setCategories(response.categories);
      } else if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await apiClient.getTags();
      if (response.success && response.data) {
        setAllTags(response.data.map(tag => tag.name));
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const loadTopBrands = async () => {
    try {
      const response = await apiClient.getAllBrands(10);
      const brands = response.brands;
      if (brands && brands.length > 0) {
        const newSuggestions = brands.map((suggestion: any) => suggestion.name);
        setBrandSuggestions(newSuggestions);
        return newSuggestions;
      }
      return [];
    } catch (error) {
      console.error('Failed to load top brands:', error);
      setBrandSuggestions([]);
      return [];
    }
  };

  const fetchBrandSuggestions = async (query: string) => {
    // For empty query, load top brands
    if (!query || query.length === 0) {
      return loadTopBrands();
    }
    
    // Only search after 3+ characters
    if (query.length < 3) {
      setBrandSuggestions([]);
      return [];
    }

    try {
      const response = await apiClient.suggestBrands(query, 10);
      if ((response as any).suggestions) {
        const newSuggestions = (response as any).suggestions.map((suggestion: any) => suggestion.text);
        setBrandSuggestions(newSuggestions);
        return newSuggestions;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch brand suggestions:', error);
      setBrandSuggestions([]);
      throw error;
    }
  };


  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleBrandInputChange = (value: string) => {
    // setBrandInputValue(value);
  };

  const handleBrandSelection = (value: string) => {
    setBrandInputValue(value);
    setFilters(prev => ({ ...prev, brand: value }));
    setCurrentPage(1);
  };

  const handleDiscountChange = (value: number) => {
    setFilters(prev => ({ ...prev, minDiscount: value.toString() }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      brand: '',
      tags: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      minDiscount: '',
      sortBy: 'newest',
      sortOrder: 'desc'
    });
    setBrandInputValue('');
    setCurrentPage(1);
  };

  const getStockStatusStyle = (status: string, stock: number) => {
    if (stock === 0) return 'text-red-500 opacity-60';
    if (status === 'Low Stock') return 'text-orange-500 font-semibold';
    return 'text-green-600';
  };

  const totalPages = Math.ceil(totalProducts / 12);

  // Calculate dynamic discount values
  const maxDiscount = Math.max(
    ...products.map(p => p.discountPercentage || 0),
    20 // minimum max of 20%
  );
  const discountMarkers = [...new Set(
    products
      .map(p => p.discountPercentage || 0)
      .filter(d => d > 0)
      .sort((a, b) => b - a)
      .slice(0, 5) // top 5 discount values as markers
  )];

  // Filter sidebar component
  const FilterSidebar = ({ className = '' }: { className?: string }) => (
    <div className={`bg-slate-50 border border-gray-300 rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <Input
              placeholder="Search products (3+ characters)..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
            />
            {filters.query && filters.query.length < 3 && filters.query.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">Enter at least 3 characters to search</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="h-4 w-4 inline mr-1" />
              Minimum Rating
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>

          {/* Brand */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <Autocomplete
              placeholder="Select or type a brand"
              value={brandInputValue}
              onChange={handleBrandInputChange}
              onSelect={handleBrandSelection}
              suggestions={brandSuggestions}
              onSuggestionsFetch={fetchBrandSuggestions}
              minChars={0}
            />
          </div> */}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <Autocomplete
              placeholder="Select or type a tag"
              value={filters.tags}
              onSelect={(value) => handleFilterChange('tags', value)}
              suggestions={allTags}
              minChars={0}
            />
          </div>

          {/* Minimum Discount */}
          <div>
            <Slider
              min={0}
              max={Math.ceil(maxDiscount / 5) * 5} // Round up to nearest 5
              step={5}
              value={Number(filters.minDiscount) || 0}
              onChange={handleDiscountChange}
              label="Min Discount"
              suffix="%"
              markers={discountMarkers}
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="space-y-2">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="discount">Discount</option>
              </select>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-100">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Product Store</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="ml-2 lg:hidden">
              {isSidebarOpen ? 'Close' : 'Filters'}
            </span>
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 min-h-screen bg-white border-r border-gray-300 shadow-sm">
          <div className="sticky top-0 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Store</h1>
              <p className="text-gray-600">Discover amazing products</p>
            </div>
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black bg-opacity-25" 
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="relative w-80 max-w-full bg-white shadow-xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-80px)] p-4">
                <FilterSidebar className="bg-transparent border-0" />
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                <p className="text-gray-600">Showing {products.length} of {totalProducts} products</p>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{totalProducts} total</span>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-8">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  Loading products...
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!loading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => {
              const discountedPrice = product.price * (1 - product.discountPercentage / 100);
              
              return (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white border-gray-200 hover:border-gray-300">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      {product.thumbnail && (
                        <img 
                          src={product.thumbnail} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      {product.discountPercentage && product.discountPercentage >= 0.5 && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-semibold rounded shadow-md">
                          -{product.discountPercentage.toFixed(0)}%
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </h3>
                        {product.brand && (
                          <p className="text-sm text-gray-500">
                            {typeof product.brand === 'string' ? product.brand : product.brand.name}
                          </p>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          {product.discountPercentage && product.discountPercentage > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium ml-1">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({(product as any).review_count || product.reviews?.length || 0} reviews)
                        </span>
                      </div>

                      {/* Availability */}
                      <div className="flex justify-between items-center">
                        <div className={`text-sm font-medium ${getStockStatusStyle(product.availabilityStatus, product.stock)}`}>
                          {product.stock === 0 ? 'Out of Stock' : product.availabilityStatus}
                          {product.stock > 0 && ` (${product.stock})`}
                        </div>
                        {product.category && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border">
                            {typeof product.category === 'string' ? product.category : product.category.name}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
                })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button 
                      variant="outline" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = currentPage <= 3 
                          ? i + 1 
                          : currentPage >= totalPages - 2 
                            ? totalPages - 4 + i 
                            : currentPage - 2 + i;
                        
                        if (page < 1 || page > totalPages) return null;
                        
                        return (
                          <Button 
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button 
                      variant="outline" 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {products.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                    <Button onClick={clearFilters}>Clear all filters</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}