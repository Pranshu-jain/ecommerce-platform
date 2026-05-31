import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sql = getDb();
  const [user] = await sql`SELECT id, email, name, role, created_at FROM users WHERE id = ${payload.userId}`;
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const res = NextResponse.json({ message: 'Logged out' });
  res.cookies.delete('auth_token');
  return res;
}
