import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/products/ProductCard';
import HomeAnimations from '@/components/home/HomeAnimations';
import { getDb } from '@/lib/db';
import { Product, Category } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.active = true AND p.featured = true
      GROUP BY p.id, c.name, c.slug
      ORDER BY p.created_at DESC LIMIT 8
    `;
    return rows.map((p: Record<string, unknown>) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images ?? []),
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags ?? []),
    })) as Product[];
  } catch { return []; }
}

async function getCategories(): Promise<Category[]> {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return rows as Category[];
  } catch { return []; }
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gray-950">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&auto=format&fit=crop&q=80"
            alt="Store background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        </div>

        {/* Floating product images */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <div className="relative h-full">
            <div className="absolute top-16 right-16 w-52 h-52 float" style={{ animationDelay: '0s' }}>
              <Image src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" alt="" fill className="object-cover rounded-2xl shadow-2xl opacity-90" />
            </div>
            <div className="absolute top-48 right-72 w-44 h-44 float" style={{ animationDelay: '0.8s' }}>
              <Image src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80" alt="" fill className="object-cover rounded-2xl shadow-2xl opacity-90" />
            </div>
            <div className="absolute bottom-32 right-24 w-48 h-48 float" style={{ animationDelay: '1.6s' }}>
              <Image src="https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&auto=format&fit=crop&q=80" alt="" fill className="object-cover rounded-2xl shadow-2xl opacity-90" />
            </div>
            <div className="absolute top-1/2 right-8 w-36 h-36 float" style={{ animationDelay: '0.4s' }}>
              <Image src="https://images.unsplash.com/photo-1601925228008-40d0b3efcd5b?w=300&auto=format&fit=crop&q=80" alt="" fill className="object-cover rounded-2xl shadow-2xl opacity-90" />
            </div>
          </div>
        </div>

        {/* Hero text — animated via client component */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <HomeAnimations
            categories={categories}
            featuredProducts={featuredProducts}
          />
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚀', title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: '🔐', title: 'Secure Payment', desc: '256-bit SSL encryption' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day no-hassle returns' },
              { icon: '💬', title: '24/7 Support', desc: 'We\'re always here' },
            ].map((f, i) => (
              <div key={f.title} className="flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-1">Browse</p>
              <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ height: i === 0 || i === 2 ? '220px' : '180px' }}
              >
                {cat.image_url ? (
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="h-full bg-indigo-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-white font-bold text-sm">{cat.name}</span>
                  <p className="text-white/70 text-xs mt-0.5 group-hover:text-white/90 transition-colors">Shop now →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-1">Handpicked</p>
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              </div>
              <Link href="/products?featured=true" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Banner ── */}
      <section className="relative overflow-hidden bg-gray-950 py-24">
        <Image
          src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&auto=format&fit=crop&q=80"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-gray-950/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-indigo-300 font-semibold text-sm uppercase tracking-widest mb-4">Limited Time</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            New Arrivals Every Week
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Sign up to get notified about exclusive deals and new products before anyone else.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="btn-primary px-8 py-3 text-base">
              Create Free Account
            </Link>
            <Link href="/products" className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition-all text-base">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
