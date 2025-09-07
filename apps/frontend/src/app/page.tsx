'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { User, Product, Category } from '@shared/types';
import { Search, Users, Package, Database, Heart } from 'lucide-react';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
    checkHealth();
  }, []);

  const loadInitialData = async () => {
    try {
      const [usersResponse, productsResponse, categoriesResponse] = await Promise.all([
        apiClient.getUsers(1, 5),
        apiClient.getProducts(1, 5),
        apiClient.getCategories(),
      ]);

      setUsers(usersResponse.data?.users || []);
      setProducts(productsResponse.data?.products || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  const checkHealth = async () => {
    try {
      const response = await apiClient.checkHealth();
      setHealthStatus(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await apiClient.search(searchQuery);
      setSearchResults(response.data);
      toast({
        title: 'Search completed',
        description: `Found results for "${searchQuery}"`,
      });
    } catch (error) {
      toast({
        title: 'Search failed',
        description: 'Could not perform search',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Fullstack Monorepo Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A modern fullstack application built with Next.js frontend, Express backend,
          MySQL database, and Elasticsearch search - all running in a production-ready monorepo.
        </p>
      </div>

      {/* Health Status */}
      {healthStatus && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {healthStatus.status === 'healthy' ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">API Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {healthStatus.services?.database === 'healthy' ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Database</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {healthStatus.services?.elasticsearch === 'healthy' ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Elasticsearch</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users & Products
          </CardTitle>
          <CardDescription>
            Search across users and products using Elasticsearch (with database fallback)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search for users or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchResults && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              {searchResults.users && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Users ({searchResults.users.total})</h4>
                  {searchResults.users.data.map((user: User) => (
                    <div key={user.id} className="p-2 border rounded mt-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.products && (
                <div>
                  <h4 className="font-medium text-gray-700">Products ({searchResults.products.total})</h4>
                  {searchResults.products.data.map((product: Product) => (
                    <div key={product.id} className="p-2 border rounded mt-1">
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-gray-600">${product.price} - {product.description.slice(0, 100)}...</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest registered users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Featured Products
            </CardTitle>
            <CardDescription>Latest products in our catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="p-3 border rounded-lg">
                  <div className="font-medium mb-1">{product.title}</div>
                  <div className="text-sm text-gray-600 mb-2">${product.price} - {product.description.slice(0, 100)}...</div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Stock: {product.stock}</span>
                    <span>Rating: {product.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Technical Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Next.js 14</div>
              <div className="text-sm text-gray-600">React Frontend</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">Express</div>
              <div className="text-sm text-gray-600">Node.js API</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">MySQL</div>
              <div className="text-sm text-gray-600">Primary Database</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">Elasticsearch</div>
              <div className="text-sm text-gray-600">Search Engine</div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">
              All services are containerized and can be started with a single command:
            </p>
            <code className="bg-gray-100 px-4 py-2 rounded text-sm">
              docker compose up
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}