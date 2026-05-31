import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
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

    const products = await sql(query, params);

    let countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active = true`;
    const countParams: (string | number)[] = [];
    let ci = 1;
    if (category) { countQuery += ` AND c.slug = $${ci++}`; countParams.push(category); }
    if (search) { countQuery += ` AND (p.name ILIKE $${ci++} OR p.description ILIKE $${ci++})`; countParams.push(`%${search}%`, `%${search}%`); }
    const [{ total }] = await sql(countQuery, countParams);

    const parsed = products.map((p: Record<string, unknown>) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images ?? []),
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags ?? []),
    }));

    return NextResponse.json({ products: parsed, total: Number(total), page, pages: Math.ceil(Number(total) / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
