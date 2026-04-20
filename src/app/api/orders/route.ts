import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';
import { CartItem, ShippingAddress } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { items, shipping_address }: { items: CartItem[]; shipping_address: ShippingAddress } = await req.json();
    const payload = getTokenFromRequest(req);

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const db = getDb();
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + tax + shipping;
    const orderId = uuidv4();

    db.prepare(`
      INSERT INTO orders (id, user_id, status, subtotal, tax, shipping, total, shipping_address)
      VALUES (?, ?, 'pending', ?, ?, ?, ?, ?)
    `).run(orderId, payload?.userId || null, subtotal, tax, shipping, total, JSON.stringify(shipping_address));

    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)
    `);
    for (const item of items) {
      insertItem.run(uuidv4(), orderId, item.product.id, item.quantity, item.product.price);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product.id);
    }

    return NextResponse.json({ orderId, total }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const orders = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(payload.userId) as Record<string, unknown>[];

  const withItems = orders.map((order) => {
    const items = db.prepare(`
      SELECT oi.*, p.name, p.image_url FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id as string);
    return { ...order, shipping_address: JSON.parse(order.shipping_address as string), items };
  });

  return NextResponse.json({ orders: withItems });
}
