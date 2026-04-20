import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.active = 1
    `;
    const params: (string | number)[] = [];

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    if (featured === 'true') {
      query += ` AND p.featured = 1`;
    }
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const products = db.prepare(query).all(...params);
    const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active = 1${category ? ' AND c.slug = ?' : ''}${search ? ' AND (p.name LIKE ? OR p.description LIKE ?)' : ''}`;
    const countParams = [...params.slice(0, params.length - 2)];
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

    const parsed = products.map((p: Record<string, unknown>) => ({
      ...p,
      images: JSON.parse((p.images as string) || '[]'),
      tags: JSON.parse((p.tags as string) || '[]'),
      featured: Boolean(p.featured),
      active: Boolean(p.active),
    }));

    return NextResponse.json({ products: parsed, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
