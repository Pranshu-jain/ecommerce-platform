import ProductCard from '@/components/products/ProductCard';
import { Product, Category } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { getDb } from '@/lib/db';

async function getProducts(searchParams: Record<string, string>) {
  try {
    const sql = getDb();
    const category = searchParams.category;
    const featured = searchParams.featured;
    const search = searchParams.search;
    const page = parseInt(searchParams.page || '1');
    const limit = parseInt(searchParams.limit || '12');
    const offset = (page - 1) * limit;

    const params: (string | number | boolean)[] = [];
    let idx = 1;
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.active = true
    `;
    if (category) { query += ` AND c.slug = $${idx++}`; params.push(category); }
    if (featured === 'true') { query += ` AND p.featured = true`; }
    if (search) {
      query += ` AND (p.name ILIKE $${idx++} OR p.description ILIKE $${idx++})`;
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ` GROUP BY p.id, c.name, c.slug ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const rows = await sql(query, params);

    let countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active = true`;
    const countParams: (string | number)[] = [];
    let ci = 1;
    if (category) { countQuery += ` AND c.slug = $${ci++}`; countParams.push(category); }
    if (search) { countQuery += ` AND (p.name ILIKE $${ci++} OR p.description ILIKE $${ci++})`; countParams.push(`%${search}%`, `%${search}%`); }
    const [{ total }] = await sql(countQuery, countParams);

    const products = rows.map((p: Record<string, unknown>) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images ?? []),
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags ?? []),
    }));

    return { products, total: Number(total), pages: Math.ceil(Number(total) / limit) };
  } catch (e) { console.error(e); return { products: [], total: 0, pages: 0 }; }
}

async function getCategories(): Promise<Category[]> {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return rows as Category[];
  } catch { return []; }
}

const categoryBanners: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&auto=format&fit=crop&q=80',
  clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80',
  'home-garden': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop&q=80',
  books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&auto=format&fit=crop&q=80',
};

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const [{ products, total, pages }, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  const currentPage = parseInt(searchParams.page || '1');
  const activeCategory = searchParams.category;
  const bannerImg = activeCategory ? categoryBanners[activeCategory] : 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80';
  const categoryLabel = activeCategory ? categories.find(c => c.slug === activeCategory)?.name : null;

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 sm:h-52 bg-gray-900 overflow-hidden">
        <Image src={bannerImg} alt="" fill className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-gray-900/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-1">
            {searchParams.search ? 'Search results' : categoryLabel ? 'Category' : 'Shop'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {searchParams.search ? `"${searchParams.search}"` : categoryLabel || 'All Products'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{total} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 text-xs uppercase tracking-wider text-gray-500">Categories</h3>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/products" className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${!activeCategory ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    All Products
                    {!activeCategory && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.slug}`} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${activeCategory === cat.slug ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {cat.name}
                      {activeCategory === cat.slug && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile categories */}
            <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
              <Link href="/products" className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!activeCategory ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>All</Link>
              {categories.map(cat => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.slug ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{cat.name}</Link>
              ))}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg font-semibold">No products found</p>
                <Link href="/products" className="text-indigo-600 hover:underline mt-2 inline-block text-sm">Clear filters</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(products as Product[]).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', String(p));
                  return (
                    <Link key={p} href={`/products?${params}`}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${currentPage === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600'}`}>
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
