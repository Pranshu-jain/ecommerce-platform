import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';

function requireAdmin(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const sql = getDb();
  const body = await req.json();
  const { name, slug, description, price, compare_price, stock, category_id, image_url, images, tags, featured, active } = body;

  await sql`
    UPDATE products SET
      name = ${name}, slug = ${slug}, description = ${description ?? null},
      price = ${price}, compare_price = ${compare_price ?? null}, stock = ${stock},
      category_id = ${category_id ?? null}, image_url = ${image_url ?? null},
      images = ${JSON.stringify(images ?? [])}, tags = ${JSON.stringify(tags ?? [])},
      featured = ${!!featured}, active = ${active !== false}
    WHERE id = ${params.id}
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const sql = getDb();
  await sql`UPDATE products SET active = false WHERE id = ${params.id}`;
  return NextResponse.json({ success: true });
}
