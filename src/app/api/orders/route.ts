import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';
import { CartItem, ShippingAddress } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const { items, shipping_address }: { items: CartItem[]; shipping_address: ShippingAddress } = await req.json();
    const payload = getTokenFromRequest(req);
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + tax + shipping;
    const orderId = uuidv4();
    const userId = payload?.userId ?? null;

    await sql`
      INSERT INTO orders (id, user_id, status, subtotal, tax, shipping, total, shipping_address)
      VALUES (${orderId}, ${userId}, 'pending', ${subtotal}, ${tax}, ${shipping}, ${total}, ${JSON.stringify(shipping_address)})
    `;

    for (const item of items) {
      await sql`INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (${uuidv4()}, ${orderId}, ${item.product.id}, ${item.quantity}, ${item.product.price})`;
      await sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product.id}`;
    }

    return NextResponse.json({ orderId, total }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sql = getDb();
  const payload = getTokenFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await sql`SELECT * FROM orders WHERE user_id = ${payload.userId} ORDER BY created_at DESC` as Record<string, unknown>[];
  const withItems = await Promise.all(orders.map(async (order) => {
    const items = await sql`
      SELECT oi.*, p.name, p.image_url FROM order_items oi
      JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ${order.id as string}
    `;
    return { ...order, shipping_address: JSON.parse(order.shipping_address as string), items };
  }));

  return NextResponse.json({ orders: withItems });
}
