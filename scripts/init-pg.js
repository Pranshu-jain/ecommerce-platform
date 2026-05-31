// Run once to set up the Neon PostgreSQL database:
//   DATABASE_URL=<your_neon_url> node scripts/init-pg.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      compare_price DECIMAL(10,2),
      stock INTEGER NOT NULL DEFAULT 0,
      category_id TEXT REFERENCES categories(id),
      image_url TEXT,
      images TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      featured BOOLEAN DEFAULT FALSE,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal DECIMAL(10,2) NOT NULL,
      tax DECIMAL(10,2) NOT NULL DEFAULT 0,
      shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_intent_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('Tables created.');

  // ── Seed categories ──
  const cats = [
    { id: uuidv4(), name: 'Electronics',   slug: 'electronics',   description: 'Gadgets and devices', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600' },
    { id: uuidv4(), name: 'Clothing',       slug: 'clothing',       description: 'Fashion and apparel', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600' },
    { id: uuidv4(), name: 'Home & Garden',  slug: 'home-garden',    description: 'Home decor and garden', image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600' },
    { id: uuidv4(), name: 'Sports',         slug: 'sports',         description: 'Sports and fitness', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600' },
    { id: uuidv4(), name: 'Books',          slug: 'books',          description: 'Books and literature', image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600' },
  ];

  const catMap = {};
  for (const c of cats) {
    await sql`INSERT INTO categories (id, name, slug, description, image_url) VALUES (${c.id}, ${c.name}, ${c.slug}, ${c.description}, ${c.image_url}) ON CONFLICT (slug) DO NOTHING`;
    catMap[c.slug] = c.id;
    console.log(`Category: ${c.name}`);
  }

  // ── Seed products ──
  const products = [
    { name: 'Wireless Noise-Cancelling Headphones', slug: 'wireless-noise-cancelling-headphones', description: 'Premium over-ear headphones with 30-hour battery life and active noise cancellation.', price: 299.99, compare_price: 399.99, stock: 50, category_id: catMap['electronics'], image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', featured: true, tags: ['headphones','audio','wireless'] },
    { name: 'Smart Watch Pro', slug: 'smart-watch-pro', description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.', price: 349.99, compare_price: 449.99, stock: 35, category_id: catMap['electronics'], image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', featured: true, tags: ['watch','smartwatch','fitness'] },
    { name: 'Vintage Denim Jacket', slug: 'vintage-denim-jacket', description: 'Classic stonewashed denim jacket with modern slim fit. Versatile and timeless.', price: 89.99, compare_price: 129.99, stock: 75, category_id: catMap['clothing'], image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600', featured: true, tags: ['jacket','denim','fashion'] },
    { name: 'Merino Wool Sweater', slug: 'merino-wool-sweater', description: 'Ultra-soft merino wool sweater, perfect for layering.', price: 119.99, compare_price: 159.99, stock: 60, category_id: catMap['clothing'], image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', featured: false, tags: ['sweater','wool','cozy'] },
    { name: 'Minimalist Desk Lamp', slug: 'minimalist-desk-lamp', description: 'LED desk lamp with adjustable color temperature and USB charging port.', price: 49.99, compare_price: 79.99, stock: 90, category_id: catMap['home-garden'], image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', featured: true, tags: ['lamp','desk','lighting'] },
    { name: 'Ceramic Plant Pot Set', slug: 'ceramic-plant-pot-set', description: 'Set of 3 elegant matte ceramic plant pots in varying sizes.', price: 34.99, compare_price: 49.99, stock: 60, category_id: catMap['home-garden'], image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600', featured: false, tags: ['plants','home-decor','ceramic'] },
    { name: 'Professional Yoga Mat', slug: 'professional-yoga-mat', description: 'Extra-thick non-slip yoga mat with alignment lines. Eco-friendly material.', price: 79.99, compare_price: 99.99, stock: 80, category_id: catMap['sports'], image_url: 'https://images.unsplash.com/photo-1601925228008-40d0b3efcd5b?w=600', featured: true, tags: ['yoga','fitness','exercise'] },
    { name: 'Adjustable Dumbbell Set', slug: 'adjustable-dumbbell-set', description: 'Space-saving adjustable dumbbells ranging from 5 to 52.5 lbs.', price: 349.99, compare_price: 449.99, stock: 25, category_id: catMap['sports'], image_url: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=600', featured: false, tags: ['dumbbells','fitness','home-gym'] },
    { name: 'Mechanical Keyboard', slug: 'mechanical-keyboard', description: 'Compact TKL mechanical keyboard with RGB backlight and Cherry MX switches.', price: 149.99, compare_price: 189.99, stock: 40, category_id: catMap['electronics'], image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', featured: false, tags: ['keyboard','mechanical','gaming'] },
  ];

  for (const p of products) {
    const id = uuidv4();
    const images = JSON.stringify([p.image_url]);
    const tags = JSON.stringify(p.tags);
    await sql`
      INSERT INTO products (id, name, slug, description, price, compare_price, stock, category_id, image_url, images, tags, featured)
      VALUES (${id}, ${p.name}, ${p.slug}, ${p.description}, ${p.price}, ${p.compare_price}, ${p.stock}, ${p.category_id}, ${p.image_url}, ${images}, ${tags}, ${p.featured})
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`Product: ${p.name}`);
  }

  // ── Admin user ──
  const adminId = uuidv4();
  const adminHash = await bcrypt.hash('admin123', 10);
  await sql`
    INSERT INTO users (id, email, password, name, role)
    VALUES (${adminId}, 'admin@example.com', ${adminHash}, 'Admin', 'admin')
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('Admin user: admin@example.com / admin123');

  console.log('\nDatabase ready!');
}

main().catch(e => { console.error(e); process.exit(1); });
