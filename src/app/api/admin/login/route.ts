import { NextResponse } from 'next/server';
import { verifyAdminCredentials, generateAdminToken } from '@/lib/admin-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid Admin username or password.' },
        { status: 401 }
      );
    }

    const token = generateAdminToken();

    return NextResponse.json({
      success: true,
      token,
      admin: {
        username: 'Admin',
        role: 'Super Administrator',
        grantedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal authentication error.' },
      { status: 500 }
    );
  }
}
