import { Suspense } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Product, Category } from '@/types';
import Link from 'next/link';

async function getProducts(searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams);
  if (!params.get('limit')) params.set('limit', '12');
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?${params}`, { cache: 'no-store' });
    if (!res.ok) return { products: [], total: 0, pages: 0 };
    return res.json();
  } catch {
    return { products: [], total: 0, pages: 0 };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch {
    return [];
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const [{ products, total, pages }, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  const currentPage = parseInt(searchParams.page || '1');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!searchParams.category ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${searchParams.category === cat.slug ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchParams.search ? `Search: "${searchParams.search}"` : searchParams.category ? categories.find(c => c.slug === searchParams.category)?.name || 'Products' : 'All Products'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{total} products found</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found.</p>
              <Link href="/products" className="text-primary-600 hover:underline mt-2 inline-block">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(products as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(p));
                return (
                  <Link
                    key={p}
                    href={`/products?${params}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === p ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
