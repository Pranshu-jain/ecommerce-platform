import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const sql = getDb();
    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await sql`INSERT INTO users (id, email, password, name, role) VALUES (${id}, ${email}, ${hashed}, ${name}, 'customer')`;
    const user = { id, email, name, role: 'customer' };
    const token = signToken({ userId: id, email, role: 'customer' });
    const res = NextResponse.json({ user, token });
    res.cookies.set('auth_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
