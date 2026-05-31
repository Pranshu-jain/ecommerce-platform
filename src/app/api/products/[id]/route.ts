import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const [product] = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE (p.id = ${params.id} OR p.slug = ${params.id}) AND p.active = true
      GROUP BY p.id, c.name, c.slug
    `;
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const reviews = await sql`
      SELECT r.*, u.name as user_name FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ${product.id as string} ORDER BY r.created_at DESC
    `;

    return NextResponse.json({
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images ?? []),
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags || '[]') : (product.tags ?? []),
      reviews,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
