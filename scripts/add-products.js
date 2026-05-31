// Run: DATABASE_URL=<url> node scripts/add-products.js
const { neon } = require('@neondatabase/serverless');
const { v4: uuidv4 } = require('uuid');

const sql = neon(process.env.DATABASE_URL);

async function main() {
  // Get category IDs
  const cats = await sql`SELECT id, slug FROM categories`;
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  const products = [
    // Electronics
    { name: 'True Wireless Earbuds Pro', slug: 'true-wireless-earbuds-pro', description: 'Premium TWS earbuds with active noise cancellation, 30hr total battery, and IPX5 water resistance. Crystal-clear calls and immersive sound.', price: 129.99, compare_price: 179.99, stock: 65, category_id: catMap['electronics'], image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop&q=80', featured: true, tags: ['earbuds', 'wireless', 'audio', 'anc'] },
    { name: 'Ultrabook Laptop 14"', slug: 'ultrabook-laptop-14', description: 'Ultra-thin 14" laptop with 12th-gen Intel Core i7, 16GB RAM, 512GB SSD. Weighs just 1.2kg. All-day battery life.', price: 1199.99, compare_price: 1499.99, stock: 20, category_id: catMap['electronics'], image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80', featured: true, tags: ['laptop', 'ultrabook', 'intel', 'portable'] },
    { name: 'Mirrorless Camera Kit', slug: 'mirrorless-camera-kit', description: '24MP mirrorless camera with 18-55mm kit lens. Perfect for beginners and enthusiasts. 4K video, in-body stabilization.', price: 849.99, compare_price: 999.99, stock: 18, category_id: catMap['electronics'], image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80', featured: false, tags: ['camera', 'photography', '4k', 'mirrorless'] },
    { name: 'Gaming Monitor 27" 165Hz', slug: 'gaming-monitor-27-165hz', description: '27-inch QHD IPS gaming monitor with 165Hz refresh rate, 1ms response time, HDR400, and AMD FreeSync Premium.', price: 399.99, compare_price: 499.99, stock: 30, category_id: catMap['electronics'], image_url: 'https://images.unsplash.com/photo-1593640408182-31c228f9d1fe?w=600&auto=format&fit=crop&q=80', featured: false, tags: ['monitor', 'gaming', '4k', 'ips'] },
    { name: 'iPad Pro 11"', slug: 'ipad-pro-11', description: 'Powerful tablet with M2 chip, Liquid Retina display, and 12-hour battery. Perfect for creativity and productivity.', price: 799.99, compare_price: 899.99, stock: 25, category_id: catMap['electronics'], image_url: 'https://images.unsplash.com/photo-1544244015-0df4592c9e47?w=600&auto=format&fit=crop&q=80', featured: true, tags: ['tablet', 'apple', 'ipad', 'portable'] },
    // Clothing
    { name: 'Air Max Running Sneakers', slug: 'air-max-running-sneakers', description: 'Lightweight running sneakers with air cushioning sole, breathable mesh upper, and superior grip. Available in sizes 6-13.', price: 119.99, compare_price: 159.99, stock: 100, category_id: catMap['clothing'], image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', featured: true, tags: ['sneakers', 'running', 'shoes', 'athletic'] },
    { name: 'Premium Leather Backpack', slug: 'premium-leather-backpack', description: 'Full-grain leather backpack with laptop compartment (up to 15"), multiple pockets, and padded straps. Ageless style.', price: 189.99, compare_price: 249.99, stock: 40, category_id: catMap['clothing'], image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', featured: false, tags: ['backpack', 'leather', 'laptop', 'bag'] },
    { name: 'Oversized Comfort Hoodie', slug: 'oversized-comfort-hoodie', description: '450gsm heavyweight cotton fleece hoodie with kangaroo pocket and dropped shoulders. The coziest hoodie you will ever own.', price: 64.99, compare_price: 89.99, stock: 120, category_id: catMap['clothing'], image_url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&auto=format&fit=crop&q=80', featured: true, tags: ['hoodie', 'oversized', 'cotton', 'cozy'] },
    { name: 'Polarized Aviator Sunglasses', slug: 'polarized-aviator-sunglasses', description: 'Classic aviator frame with polarized UV400 lenses. Reduces glare by 99.9%. Stainless steel frame, lightweight at 28g.', price: 79.99, compare_price: 119.99, stock: 80, category_id: catMap['clothing'], image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80', featured: false, tags: ['sunglasses', 'polarized', 'uv400', 'aviator'] },
    // Home & Garden
    { name: 'Pour-Over Coffee Set', slug: 'pour-over-coffee-set', description: 'Complete pour-over coffee kit with borosilicate glass dripper, gooseneck kettle, precision scale, and 50 filters. Barista-quality at home.', price: 89.99, compare_price: 119.99, stock: 55, category_id: catMap['home-garden'], image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80', featured: true, tags: ['coffee', 'pour-over', 'kitchen', 'barista'] },
    { name: 'Luxury Scented Candle Set', slug: 'luxury-scented-candle-set', description: 'Set of 4 hand-poured soy wax candles in amber jars. Scents: Sandalwood & Vanilla, Lavender Fields, Fresh Linen, Cedar & Sage. 50hr burn each.', price: 54.99, compare_price: 74.99, stock: 70, category_id: catMap['home-garden'], image_url: 'https://images.unsplash.com/photo-1602178506049-17ac06d4c81e?w=600&auto=format&fit=crop&q=80', featured: false, tags: ['candles', 'soy', 'home-decor', 'scented'] },
    { name: 'Chunky Knit Throw Blanket', slug: 'chunky-knit-throw-blanket', description: 'Hand-knitted chunky merino wool throw blanket. Incredibly soft, 130x160cm. Perfect for couches and beds. Multiple colors available.', price: 99.99, compare_price: 139.99, stock: 45, category_id: catMap['home-garden'], image_url: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&auto=format&fit=crop&q=80', featured: false, tags: ['blanket', 'knit', 'wool', 'cozy'] },
    // Sports
    { name: 'Smart Water Bottle 1L', slug: 'smart-water-bottle-1l', description: 'Insulated stainless steel bottle that keeps drinks cold 24hr / hot 12hr. Hydration tracking LED indicator. BPA-free, dishwasher safe.', price: 44.99, compare_price: 64.99, stock: 90, category_id: catMap['sports'], image_url: 'https://images.unsplash.com/photo-1553531888-bb8e77bc7d0b?w=600&auto=format&fit=crop&q=80', featured: false, tags: ['water-bottle', 'hydration', 'insulated', 'steel'] },
    { name: 'Resistance Band Set (5 pcs)', slug: 'resistance-band-set-5-pcs', description: 'Set of 5 latex resistance bands (10-50lb resistance levels) with door anchor, handles, and ankle straps. Full-body workout anywhere.', price: 29.99, compare_price: 49.99, stock: 150, category_id: catMap['sports'], image_url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&auto=format&fit=crop&q=80', featured: true, tags: ['resistance-bands', 'fitness', 'home-gym', 'workout'] },
    // Books
    { name: 'The Productivity Blueprint', slug: 'the-productivity-blueprint', description: 'Bestselling guide to building deep work habits, managing energy not time, and creating a life of focused output. 320 pages.', price: 24.99, compare_price: 34.99, stock: 200, category_id: catMap['books'], image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', featured: false, tags: ['book', 'productivity', 'self-help', 'focus'] },
  ];

  let added = 0;
  for (const p of products) {
    const id = uuidv4();
    const images = JSON.stringify([p.image_url]);
    const tags = JSON.stringify(p.tags);
    await sql`
      INSERT INTO products (id, name, slug, description, price, compare_price, stock, category_id, image_url, images, tags, featured)
      VALUES (${id}, ${p.name}, ${p.slug}, ${p.description}, ${p.price}, ${p.compare_price}, ${p.stock}, ${p.category_id}, ${p.image_url}, ${images}, ${tags}, ${p.featured})
      ON CONFLICT (slug) DO NOTHING
    `;
    added++;
    console.log(`✓ ${p.name}`);
  }
  console.log(`\n${added} products processed.`);
}

main().catch(e => { console.error(e); process.exit(1); });
