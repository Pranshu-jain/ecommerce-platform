import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';

function requireAdmin(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const sql = getDb();
  const products = await sql`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  ` as Record<string, unknown>[];

  return NextResponse.json({
    products: products.map(p => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images ?? []),
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags ?? []),
    }))
  });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const sql = getDb();
  const body = await req.json();
  const { name, slug, description, price, compare_price, stock, category_id, image_url, images, tags, featured } = body;
  if (!name || !price || !slug) return NextResponse.json({ error: 'Name, slug, and price are required' }, { status: 400 });

  const id = uuidv4();
  await sql`
    INSERT INTO products (id, name, slug, description, price, compare_price, stock, category_id, image_url, images, tags, featured)
    VALUES (${id}, ${name}, ${slug}, ${description ?? null}, ${price}, ${compare_price ?? null}, ${stock ?? 0}, ${category_id ?? null}, ${image_url ?? null}, ${JSON.stringify(images ?? [])}, ${JSON.stringify(tags ?? [])}, ${!!featured})
  `;
  return NextResponse.json({ id }, { status: 201 });
}
