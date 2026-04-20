import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE (p.id = ? OR p.slug = ?) AND p.active = 1
      GROUP BY p.id
    `).get(params.id, params.id) as Record<string, unknown> | undefined;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? ORDER BY r.created_at DESC
    `).all(product.id as string);

    return NextResponse.json({
      ...product,
      images: JSON.parse((product.images as string) || '[]'),
      tags: JSON.parse((product.tags as string) || '[]'),
      featured: Boolean(product.featured),
      active: Boolean(product.active),
      reviews,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
