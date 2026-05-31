import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    const sql = getDb();
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!user || !(await bcrypt.compare(password, user.password as string))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = signToken({ userId: user.id as string, email: user.email as string, role: user.role as string });
    const { password: _pw, ...safeUser } = user;
    const res = NextResponse.json({ user: safeUser, token });
    res.cookies.set('auth_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
