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
  const body = await req.json();
  const { name, slug, description, price, compare_price, stock, category_id, image_url, images, tags, featured, active } = body;

  const db = getDb();
  db.prepare(`
    UPDATE products SET name=?, slug=?, description=?, price=?, compare_price=?, stock=?,
    category_id=?, image_url=?, images=?, tags=?, featured=?, active=?
    WHERE id=?
  `).run(name, slug, description, price, compare_price || null, stock, category_id || null,
    image_url, JSON.stringify(images || []), JSON.stringify(tags || []),
    featured ? 1 : 0, active !== false ? 1 : 0, params.id);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(params.id);
  return NextResponse.json({ success: true });
}
