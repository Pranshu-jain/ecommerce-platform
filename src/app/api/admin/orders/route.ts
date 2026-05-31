import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sql = getDb();
  const orders = await sql`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  ` as Record<string, unknown>[];

  const withItems = await Promise.all(orders.map(async (order) => {
    const items = await sql`
      SELECT oi.*, p.name, p.image_url FROM order_items oi
      JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ${order.id as string}
    `;
    return { ...order, shipping_address: JSON.parse(order.shipping_address as string), items };
  }));

  return NextResponse.json({ orders: withItems });
}

export async function PATCH(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const sql = getDb();
  const { orderId, status } = await req.json();
  await sql`UPDATE orders SET status = ${status} WHERE id = ${orderId}`;
  return NextResponse.json({ success: true });
}
