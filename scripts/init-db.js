const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'ecommerce.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    compare_price REAL,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id TEXT,
    image_url TEXT,
    images TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',
    featured INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    subtotal REAL NOT NULL,
    tax REAL NOT NULL DEFAULT 0,
    shipping REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_intent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed admin user
const adminPassword = bcrypt.hashSync('admin123', 10);
const adminId = uuidv4();
try {
  db.prepare(`INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`).run(
    adminId, 'admin@shop.com', adminPassword, 'Admin User', 'admin'
  );
  console.log('Admin user created: admin@shop.com / admin123');
} catch {
  console.log('Admin user already exists');
}

// Seed categories
const categories = [
  { id: uuidv4(), name: 'Electronics', slug: 'electronics', description: 'Gadgets and tech devices', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
  { id: uuidv4(), name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400' },
  { id: uuidv4(), name: 'Home & Garden', slug: 'home-garden', description: 'Home decor and garden supplies', image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400' },
  { id: uuidv4(), name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories', image_url: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400' },
];

const insertCategory = db.prepare(`INSERT OR IGNORE INTO categories (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)`);
for (const cat of categories) {
  insertCategory.run(cat.id, cat.name, cat.slug, cat.description, cat.image_url);
}
console.log('Categories seeded');

// Seed products
const categoryMap = {};
for (const cat of categories) categoryMap[cat.slug] = cat.id;

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality.',
    price: 299.99,
    compare_price: 399.99,
    stock: 50,
    category_id: categoryMap['electronics'],
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    featured: 1,
    tags: JSON.stringify(['wireless', 'audio', 'noise-cancelling']),
  },
  {
    name: 'Smart Watch Pro',
    slug: 'smart-watch-pro',
    description: 'Feature-packed smartwatch with health monitoring, GPS, and a stunning AMOLED display.',
    price: 249.99,
    compare_price: 299.99,
    stock: 35,
    category_id: categoryMap['electronics'],
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    featured: 1,
    tags: JSON.stringify(['smartwatch', 'fitness', 'tech']),
  },
  {
    name: '4K Ultra HD Monitor',
    slug: '4k-ultra-hd-monitor',
    description: '27-inch 4K IPS display with HDR support, USB-C connectivity, and 144Hz refresh rate.',
    price: 549.99,
    compare_price: 699.99,
    stock: 20,
    category_id: categoryMap['electronics'],
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
    featured: 0,
    tags: JSON.stringify(['monitor', '4k', 'display']),
  },
  {
    name: 'Classic White Sneakers',
    slug: 'classic-white-sneakers',
    description: 'Timeless white sneakers crafted with premium leather, perfect for any casual occasion.',
    price: 89.99,
    compare_price: 119.99,
    stock: 100,
    category_id: categoryMap['clothing'],
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    featured: 1,
    tags: JSON.stringify(['shoes', 'sneakers', 'casual']),
  },
  {
    name: 'Premium Denim Jacket',
    slug: 'premium-denim-jacket',
    description: 'High-quality denim jacket with a modern fit. A wardrobe essential for every season.',
    price: 129.99,
    compare_price: null,
    stock: 45,
    category_id: categoryMap['clothing'],
    image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600',
    featured: 0,
    tags: JSON.stringify(['jacket', 'denim', 'fashion']),
  },
  {
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    description: 'Sleek LED desk lamp with adjustable brightness, color temperature, and a USB charging port.',
    price: 59.99,
    compare_price: 79.99,
    stock: 75,
    category_id: categoryMap['home-garden'],
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    featured: 1,
    tags: JSON.stringify(['lamp', 'desk', 'lighting']),
  },
  {
    name: 'Ceramic Plant Pot Set',
    slug: 'ceramic-plant-pot-set',
    description: 'Set of 3 elegant matte ceramic plant pots in varying sizes. Perfect for indoor plants.',
    price: 34.99,
    compare_price: 49.99,
    stock: 60,
    category_id: categoryMap['home-garden'],
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600',
    featured: 0,
    tags: JSON.stringify(['plants', 'home-decor', 'ceramic']),
  },
  {
    name: 'Professional Yoga Mat',
    slug: 'professional-yoga-mat',
    description: 'Extra-thick non-slip yoga mat with alignment lines. Eco-friendly material for superior grip.',
    price: 79.99,
    compare_price: 99.99,
    stock: 80,
    category_id: categoryMap['sports'],
    image_url: 'https://images.unsplash.com/photo-1601925228008-40d0b3efcd5b?w=600',
    featured: 1,
    tags: JSON.stringify(['yoga', 'fitness', 'exercise']),
  },
  {
    name: 'Adjustable Dumbbell Set',
    slug: 'adjustable-dumbbell-set',
    description: 'Space-saving adjustable dumbbells ranging from 5 to 52.5 lbs. Perfect for home workouts.',
    price: 349.99,
    compare_price: 449.99,
    stock: 25,
    category_id: categoryMap['sports'],
    image_url: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=600',
    featured: 0,
    tags: JSON.stringify(['dumbbells', 'fitness', 'home-gym']),
  },
  {
    name: 'Mechanical Keyboard',
    slug: 'mechanical-keyboard',
    description: 'Compact tenkeyless mechanical keyboard with RGB backlight, Cherry MX switches, and aluminum frame.',
    price: 149.99,
    compare_price: 189.99,
    stock: 40,
    category_id: categoryMap['electronics'],
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    featured: 0,
    tags: JSON.stringify(['keyboard', 'mechanical', 'gaming']),
  },
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, slug, description, price, compare_price, stock, category_id, image_url, featured, tags, images)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const product of products) {
  insertProduct.run(
    uuidv4(),
    product.name,
    product.slug,
    product.description,
    product.price,
    product.compare_price || null,
    product.stock,
    product.category_id,
    product.image_url,
    product.featured,
    product.tags,
    JSON.stringify([product.image_url])
  );
}
console.log('Products seeded');

db.close();
console.log('Database initialized successfully!');
